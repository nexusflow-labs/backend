import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ListActivitiesUseCase } from '../application/use-cases/list-activities.use-case';
import {
  ActivityLogQueryDto,
  EntityActivityQueryDto,
} from './dtos/activity-log.request.dto';
import { ActivityLogResponseDto } from './dtos/activity-log.response.dto';
import { EntityType } from '../domain/enums/entity-type.enum';
import { PaginatedResult } from 'src/infrastructure/common/pagination';
import { ActivityLogFilters } from '../domain/repositories/activity-log.repository';

@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly listActivitiesUseCase: ListActivitiesUseCase) {}

  @Get()
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
