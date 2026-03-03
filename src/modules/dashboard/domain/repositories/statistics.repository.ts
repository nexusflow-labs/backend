import { WorkspaceStatistics } from '../entities/workspace-statistics.entity';

export abstract class IStatisticsRepository {
  abstract getWorkspaceStatistics(
    workspaceId: string,
  ): Promise<WorkspaceStatistics>;
}
