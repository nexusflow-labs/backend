import { WorkspaceStatistics } from '../../domain/entities/workspace-statistics.entity';

export class TasksByStatusDto {
  status: string;
  count: number;
}

export class TasksByPriorityDto {
  priority: string;
  count: number;
}

export class ProjectStatsDto {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export class WorkspaceStatisticsResponseDto {
  workspaceId: string;
  totalProjects: number;
  totalTasks: number;
  totalMembers: number;
  tasksByStatus: TasksByStatusDto[];
  tasksByPriority: TasksByPriorityDto[];
  overdueTasks: number;
  tasksCompletedThisWeek: number;
  tasksCreatedThisWeek: number;
  projectStats: ProjectStatsDto[];

  static fromEntity(
    entity: WorkspaceStatistics,
  ): WorkspaceStatisticsResponseDto {
    const dto = new WorkspaceStatisticsResponseDto();
    dto.workspaceId = entity.workspaceId;
    dto.totalProjects = entity.totalProjects;
    dto.totalTasks = entity.totalTasks;
    dto.totalMembers = entity.totalMembers;
    dto.tasksByStatus = entity.tasksByStatus;
    dto.tasksByPriority = entity.tasksByPriority;
    dto.overdueTasks = entity.overdueTasks;
    dto.tasksCompletedThisWeek = entity.tasksCompletedThisWeek;
    dto.tasksCreatedThisWeek = entity.tasksCreatedThisWeek;
    dto.projectStats = entity.projectStats;
    return dto;
  }
}
