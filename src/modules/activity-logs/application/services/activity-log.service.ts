import { Injectable, Inject } from '@nestjs/common';
import { IActivityLogRepository } from '../../domain/repositories/activity-log.repository';
import { ActivityAction } from '../../domain/enums/activity-action.enum';
import { EntityType } from '../../domain/enums/entity-type.enum';
import { ActivityLog } from '../../domain/entities/activity-log.entity';

@Injectable()
export class ActivityLogService {
  constructor(
    @Inject(IActivityLogRepository)
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  async logCreate(
    entityType: EntityType,
    entityId: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.CREATE,
      entityType,
      entityId,
      userId,
      metadata,
    });
  }

  async logUpdate(
    entityType: EntityType,
    entityId: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.UPDATE,
      entityType,
      entityId,
      userId,
      metadata,
    });
  }

  async logDelete(
    entityType: EntityType,
    entityId: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.DELETE,
      entityType,
      entityId,
      userId,
      metadata,
    });
  }

  async logAssign(
    entityId: string,
    userId: string,
    assigneeId: string,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.ASSIGN,
      entityType: EntityType.TASK,
      entityId,
      userId,
      metadata: { assigneeId },
    });
  }

  async logUnassign(
    entityId: string,
    userId: string,
    previousAssigneeId: string,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.UNASSIGN,
      entityType: EntityType.TASK,
      entityId,
      userId,
      metadata: { previousAssigneeId },
    });
  }

  async logComment(
    taskId: string,
    commentId: string,
    userId: string,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.COMMENT,
      entityType: EntityType.TASK,
      entityId: taskId,
      userId,
      metadata: { commentId },
    });
  }

  async logStatusChange(
    entityId: string,
    userId: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.STATUS_CHANGE,
      entityType: EntityType.TASK,
      entityId,
      userId,
      metadata: { oldStatus, newStatus },
    });
  }
}
