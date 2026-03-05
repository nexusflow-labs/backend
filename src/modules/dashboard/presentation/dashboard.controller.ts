import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { GetWorkspaceStatisticsUseCase } from '../application/use-cases/get-workspace-statistics.use-case';
import { WorkspaceStatisticsResponseDto } from './dtos/workspace-statistics.response.dto';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';

@Controller('workspaces/:workspaceId/dashboard')
@UseGuards(WorkspaceMemberGuard)
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
