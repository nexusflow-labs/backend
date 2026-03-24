import {
  Controller,
  Get,
  Param,
  Query,
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
import { ListActivitiesUseCase } from '../application/use-cases/list-activities.use-case';
import {
  ActivityLogQueryDto,
  EntityActivityQueryDto,
} from './dtos/activity-log.request.dto';
import {
  ActivityLogResponseDto,
  PaginatedActivityLogResponseDto,
} from './dtos/activity-log.response.dto';
import { EntityType } from '../domain/enums/entity-type.enum';
import { PaginatedResult } from 'src/infrastructure/common/pagination';
import { ActivityLogFilters } from '../domain/repositories/activity-log.repository';
import { WorkspaceMemberGuard } from 'src/infrastructure/authorization/guards/workspace-member.guard';

@ApiTags('Activity Logs')
@ApiBearerAuth('JWT-auth')
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly listActivitiesUseCase: ListActivitiesUseCase) {}

  @Get()
  @ApiOperation({ summary: 'List activity logs with filters' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of activity logs',
    type: PaginatedActivityLogResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(
    @Query() query: ActivityLogQueryDto,
  ): Promise<PaginatedResult<ActivityLogResponseDto>> {
    const filters: ActivityLogFilters = {
      entityType: query.entityType,
      entityId: query.entityId,
      userId: query.userId,
      action: query.action,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    };

    const pagination = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    };

    const result = await this.listActivitiesUseCase.executePaginated(
      filters,
      pagination,
    );

    return {
      items: ActivityLogResponseDto.fromEntities(result.items),
      meta: result.meta,
    };
  }

  @Get('tasks/:taskId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get activity logs for a task' })
  @ApiParam({
    name: 'taskId',
    description: 'Task ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of activity logs',
    type: PaginatedActivityLogResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a workspace member' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTaskActivities(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Query() query: EntityActivityQueryDto,
  ): Promise<PaginatedResult<ActivityLogResponseDto>> {
    const pagination = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    };

    const result = await this.listActivitiesUseCase.executeByEntityPaginated(
      EntityType.TASK,
      taskId,
      pagination,
    );

    return {
      items: ActivityLogResponseDto.fromEntities(result.items),
      meta: result.meta,
    };
  }

  @Get('projects/:projectId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get activity logs for a project' })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of activity logs',
    type: PaginatedActivityLogResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a workspace member' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProjectActivities(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Query() query: EntityActivityQueryDto,
  ): Promise<PaginatedResult<ActivityLogResponseDto>> {
    const pagination = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    };

    const result = await this.listActivitiesUseCase.executeByEntityPaginated(
      EntityType.PROJECT,
      projectId,
      pagination,
    );

    return {
      items: ActivityLogResponseDto.fromEntities(result.items),
      meta: result.meta,
    };
  }

  @Get('workspaces/:workspaceId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get activity logs for a workspace' })
  @ApiParam({
    name: 'workspaceId',
    description: 'Workspace ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of activity logs',
    type: PaginatedActivityLogResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a workspace member' })
  async getWorkspaceActivities(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Query() query: EntityActivityQueryDto,
  ): Promise<PaginatedResult<ActivityLogResponseDto>> {
    const pagination = {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    };

    const result = await this.listActivitiesUseCase.executeByEntityPaginated(
      EntityType.WORKSPACE,
      workspaceId,
      pagination,
    );

    return {
      items: ActivityLogResponseDto.fromEntities(result.items),
      meta: result.meta,
    };
  }
}
