export interface TasksByStatus {
  status: string;
  count: number;
}

export interface TasksByPriority {
  priority: string;
  count: number;
}

export interface ProjectStats {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export interface WorkspaceStatisticsProps {
  workspaceId: string;
  totalProjects: number;
  totalTasks: number;
  totalMembers: number;
  tasksByStatus: TasksByStatus[];
  tasksByPriority: TasksByPriority[];
  overdueTasks: number;
  tasksCompletedThisWeek: number;
  tasksCreatedThisWeek: number;
  projectStats: ProjectStats[];
}

export class WorkspaceStatistics {
  private constructor(private readonly props: WorkspaceStatisticsProps) {}

  static create(props: WorkspaceStatisticsProps): WorkspaceStatistics {
    return new WorkspaceStatistics(props);
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get totalProjects(): number {
    return this.props.totalProjects;
  }

  get totalTasks(): number {
    return this.props.totalTasks;
  }

  get totalMembers(): number {
    return this.props.totalMembers;
  }

  get tasksByStatus(): TasksByStatus[] {
    return this.props.tasksByStatus;
  }

  get tasksByPriority(): TasksByPriority[] {
    return this.props.tasksByPriority;
  }

  get overdueTasks(): number {
    return this.props.overdueTasks;
  }

  get tasksCompletedThisWeek(): number {
    return this.props.tasksCompletedThisWeek;
  }

  get tasksCreatedThisWeek(): number {
    return this.props.tasksCreatedThisWeek;
  }

  get projectStats(): ProjectStats[] {
    return this.props.projectStats;
  }
}
