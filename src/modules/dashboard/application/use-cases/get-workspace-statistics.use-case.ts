import { Injectable, NotFoundException } from '@nestjs/common';
import { IStatisticsRepository } from '../../domain/repositories/statistics.repository';
import { WorkspaceStatistics } from '../../domain/entities/workspace-statistics.entity';
import { ICacheService } from 'src/infrastructure/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { IWorkspaceRepository } from 'src/modules/workspaces/domain/repositories/workspaces.repository';

@Injectable()
export class GetWorkspaceStatisticsUseCase {
  private readonly cacheTtl: number;

  constructor(
    private readonly statisticsRepository: IStatisticsRepository,
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly cacheService: ICacheService,
    private readonly configService: ConfigService,
  ) {
    this.cacheTtl = this.configService.get<number>('CACHE_TTL_DASHBOARD', 300);
  }

  async execute(workspaceId: string): Promise<WorkspaceStatistics> {
    // Verify workspace exists
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Check cache first
    const cacheKey = `dashboard:workspace:${workspaceId}`;
    const cached = await this.cacheService.get<WorkspaceStatistics>(cacheKey);

    if (cached) {
      return WorkspaceStatistics.create(cached);
    }

    const statistics =
      await this.statisticsRepository.getWorkspaceStatistics(workspaceId);

    await this.cacheService.set(
      cacheKey,
      {
        workspaceId: statistics.workspaceId,
        totalProjects: statistics.totalProjects,
        totalTasks: statistics.totalTasks,
        totalMembers: statistics.totalMembers,
        tasksByStatus: statistics.tasksByStatus,
        tasksByPriority: statistics.tasksByPriority,
        overdueTasks: statistics.overdueTasks,
        tasksCompletedThisWeek: statistics.tasksCompletedThisWeek,
        tasksCreatedThisWeek: statistics.tasksCreatedThisWeek,
        projectStats: statistics.projectStats,
      },
      this.cacheTtl,
    );

    return statistics;
  }

  async invalidateCache(workspaceId: string): Promise<void> {
    const cacheKey = `dashboard:workspace:${workspaceId}`;
    await this.cacheService.del(cacheKey);
  }
}
