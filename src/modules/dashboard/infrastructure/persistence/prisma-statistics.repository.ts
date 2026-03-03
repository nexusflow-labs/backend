import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { IStatisticsRepository } from '../../domain/repositories/statistics.repository';
import {
  WorkspaceStatistics,
  TasksByStatus,
  TasksByPriority,
  ProjectStats,
} from '../../domain/entities/workspace-statistics.entity';

@Injectable()
export class PrismaStatisticsRepository implements IStatisticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkspaceStatistics(
    workspaceId: string,
  ): Promise<WorkspaceStatistics> {
    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    // Get all projects for this workspace
    const projects = await this.prisma.project.findMany({
      where: { workspaceId, deletedAt: null },
      select: { id: true, name: true },
    });

    const projectIds = projects.map((p) => p.id);

    // Run all queries in parallel
    const [
      totalMembers,
      totalTasks,
      tasksByStatusRaw,
      tasksByPriorityRaw,
      overdueTasks,
      tasksCompletedThisWeek,
      tasksCreatedThisWeek,
      projectTaskCounts,
    ] = await Promise.all([
      // Total members
      this.prisma.member.count({
        where: { workspaceId },
      }),

      // Total tasks
      this.prisma.task.count({
        where: { projectId: { in: projectIds }, deletedAt: null },
      }),

      // Tasks by status
      this.prisma.task.groupBy({
        by: ['status'],
        where: { projectId: { in: projectIds }, deletedAt: null },
        _count: { id: true },
      }),

      // Tasks by priority
      this.prisma.task.groupBy({
        by: ['priority'],
        where: { projectId: { in: projectIds }, deletedAt: null },
        _count: { id: true },
      }),

      // Overdue tasks
      this.prisma.task.count({
        where: {
          projectId: { in: projectIds },
          deletedAt: null,
          dueDate: { lt: new Date() },
          status: { not: 'DONE' },
        },
      }),

      // Tasks completed this week
      this.prisma.task.count({
        where: {
          projectId: { in: projectIds },
          deletedAt: null,
          status: 'DONE',
          updatedAt: { gte: startOfWeek },
        },
      }),

      // Tasks created this week
      this.prisma.task.count({
        where: {
          projectId: { in: projectIds },
          deletedAt: null,
          createdAt: { gte: startOfWeek },
        },
      }),

      // Task counts per project
      this.prisma.task.groupBy({
        by: ['projectId', 'status'],
        where: { projectId: { in: projectIds }, deletedAt: null },
        _count: { id: true },
      }),
    ]);

    // Transform tasks by status
    const tasksByStatus: TasksByStatus[] = tasksByStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    // Transform tasks by priority
    const tasksByPriority: TasksByPriority[] = tasksByPriorityRaw.map(
      (item) => ({
        priority: item.priority,
        count: item._count.id,
      }),
    );

    // Calculate project stats
    const projectStatsMap = new Map<
      string,
      { total: number; completed: number }
    >();

    for (const project of projects) {
      projectStatsMap.set(project.id, { total: 0, completed: 0 });
    }

    for (const item of projectTaskCounts) {
      const stats = projectStatsMap.get(item.projectId);
      if (stats) {
        stats.total += item._count.id;
        if (item.status === 'DONE') {
          stats.completed += item._count.id;
        }
      }
    }

    const projectStats: ProjectStats[] = projects.map((project) => {
      const stats = projectStatsMap.get(project.id) || {
        total: 0,
        completed: 0,
      };
      return {
        projectId: project.id,
        projectName: project.name,
        totalTasks: stats.total,
        completedTasks: stats.completed,
        completionRate:
          stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0,
      };
    });

    return WorkspaceStatistics.create({
      workspaceId,
      totalProjects: projects.length,
      totalTasks,
      totalMembers,
      tasksByStatus,
      tasksByPriority,
      overdueTasks,
      tasksCompletedThisWeek,
      tasksCreatedThisWeek,
      projectStats,
    });
  }
}
