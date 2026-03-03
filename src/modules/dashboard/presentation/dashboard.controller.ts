import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { GetWorkspaceStatisticsUseCase } from '../application/use-cases/get-workspace-statistics.use-case';
import { WorkspaceStatisticsResponseDto } from './dtos/workspace-statistics.response.dto';

@Controller('workspaces/:workspaceId/dashboard')
export class DashboardController {
  constructor(
    private readonly getWorkspaceStatisticsUseCase: GetWorkspaceStatisticsUseCase,
  ) {}

  @Get()
  async getStatistics(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
  ): Promise<WorkspaceStatisticsResponseDto> {
    const statistics =
      await this.getWorkspaceStatisticsUseCase.execute(workspaceId);
    return WorkspaceStatisticsResponseDto.fromEntity(statistics);
  }
}
