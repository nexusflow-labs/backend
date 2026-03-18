import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceStatistics } from '../../domain/entities/workspace-statistics.entity';

export class TasksByStatusDto {
  @ApiProperty({ description: 'Task status', example: 'TODO' })
  status: string;

  @ApiProperty({ description: 'Number of tasks', example: 10 })
  count: number;
}

export class TasksByPriorityDto {
  @ApiProperty({ description: 'Task priority', example: 'HIGH' })
  priority: string;

  @ApiProperty({ description: 'Number of tasks', example: 5 })
  count: number;
}

export class ProjectStatsDto {
  @ApiProperty({
    description: 'Project ID',
    example: 'c6e39e84-a1b0-4a13-b268-a271295ee378',
  })
  projectId: string;

  @ApiProperty({ description: 'Project name', example: 'My Project' })
  projectName: string;

  @ApiProperty({ description: 'Total tasks in project', example: 25 })
  totalTasks: number;

  @ApiProperty({ description: 'Completed tasks in project', example: 15 })
  completedTasks: number;

  @ApiProperty({
    description: 'Task completion rate (0-100)',
    example: 60,
  })
  completionRate: number;
}

export class WorkspaceStatisticsResponseDto {
  @ApiProperty({
    description: 'Workspace ID',
    example: '48a30c8b-53ca-4786-9d60-942bd1c2e241',
  })
  workspaceId: string;

  @ApiProperty({ description: 'Total number of projects', example: 5 })
  totalProjects: number;

  @ApiProperty({ description: 'Total number of tasks', example: 100 })
  totalTasks: number;

  @ApiProperty({ description: 'Total number of members', example: 10 })
  totalMembers: number;

  @ApiProperty({
    description: 'Tasks grouped by status',
    type: [TasksByStatusDto],
  })
  tasksByStatus: TasksByStatusDto[];

  @ApiProperty({
    description: 'Tasks grouped by priority',
    type: [TasksByPriorityDto],
  })
  tasksByPriority: TasksByPriorityDto[];

  @ApiProperty({ description: 'Number of overdue tasks', example: 3 })
  overdueTasks: number;

  @ApiProperty({
    description: 'Tasks completed in the current week',
    example: 12,
  })
  tasksCompletedThisWeek: number;

  @ApiProperty({
    description: 'Tasks created in the current week',
    example: 8,
  })
  tasksCreatedThisWeek: number;

  @ApiProperty({
    description: 'Statistics per project',
    type: [ProjectStatsDto],
  })
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
