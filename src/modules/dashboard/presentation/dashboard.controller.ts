import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { GetWorkspaceStatisticsUseCase } from '../application/use-cases/get-workspace-statistics.use-case';
import { WorkspaceStatisticsResponseDto } from './dtos/workspace-statistics.response.dto';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('workspaces/:workspaceId/dashboard')
@UseGuards(WorkspaceMemberGuard)
export class DashboardController {
  constructor(
    private readonly getWorkspaceStatisticsUseCase: GetWorkspaceStatisticsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get workspace statistics and dashboard data' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Workspace statistics', type: WorkspaceStatisticsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a workspace member' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async getStatistics(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
  ): Promise<WorkspaceStatisticsResponseDto> {
    const statistics =
      await this.getWorkspaceStatisticsUseCase.execute(workspaceId);
    return WorkspaceStatisticsResponseDto.fromEntity(statistics);
  }
}
