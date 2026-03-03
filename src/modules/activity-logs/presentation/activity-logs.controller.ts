import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ListActivitiesUseCase } from '../application/use-cases/list-activities.use-case';
import { ActivityLogFilterDto } from './dtos/activity-log.request.dto';
import { ActivityLogResponseDto } from './dtos/activity-log.response.dto';
import { EntityType } from '../domain/enums/entity-type.enum';

@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly listActivitiesUseCase: ListActivitiesUseCase) {}

  @Get()
  async list(
    @Query() filters: ActivityLogFilterDto,
  ): Promise<ActivityLogResponseDto[]> {
    const activities = await this.listActivitiesUseCase.execute(filters);
    return ActivityLogResponseDto.fromEntities(activities);
  }

  @Get('tasks/:taskId')
  async getTaskActivities(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
  ): Promise<ActivityLogResponseDto[]> {
    const activities = await this.listActivitiesUseCase.executeByEntity(
      EntityType.TASK,
      taskId,
    );
    return ActivityLogResponseDto.fromEntities(activities);
  }

  @Get('projects/:projectId')
  async getProjectActivities(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ): Promise<ActivityLogResponseDto[]> {
    const activities = await this.listActivitiesUseCase.executeByEntity(
      EntityType.PROJECT,
      projectId,
    );
    return ActivityLogResponseDto.fromEntities(activities);
  }
}
