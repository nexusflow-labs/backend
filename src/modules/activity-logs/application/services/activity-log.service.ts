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
    workspaceId: string,
    metadata?: Record<string, any>,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.CREATE,
      entityType,
      entityId,
      userId,
      workspaceId,
      metadata,
    });
  }

  async logUpdate(
    entityType: EntityType,
    entityId: string,
    userId: string,
    workspaceId: string,
    metadata?: Record<string, any>,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.UPDATE,
      entityType,
      entityId,
      userId,
      workspaceId,
      metadata,
    });
  }

  async logDelete(
    entityType: EntityType,
    entityId: string,
    userId: string,
    workspaceId: string,
    metadata?: Record<string, any>,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.DELETE,
      entityType,
      entityId,
      userId,
      workspaceId,
      metadata,
    });
  }

  async logAssign(
    entityId: string,
    userId: string,
    workspaceId: string,
    assigneeId: string,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.ASSIGN,
      entityType: EntityType.TASK,
      entityId,
      userId,
      workspaceId,
      metadata: { assigneeId },
    });
  }

  async logUnassign(
    entityId: string,
    userId: string,
    workspaceId: string,
    previousAssigneeId: string,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.UNASSIGN,
      entityType: EntityType.TASK,
      entityId,
      userId,
      workspaceId,
      metadata: { previousAssigneeId },
    });
  }

  async logComment(
    taskId: string,
    commentId: string,
    userId: string,
    workspaceId: string,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.COMMENT,
      entityType: EntityType.TASK,
      entityId: taskId,
      userId,
      workspaceId,
      metadata: { commentId },
    });
  }

  async logStatusChange(
    entityId: string,
    userId: string,
    workspaceId: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<ActivityLog> {
    return this.activityLogRepository.create({
      action: ActivityAction.STATUS_CHANGE,
      entityType: EntityType.TASK,
      entityId,
      userId,
      workspaceId,
      metadata: { oldStatus, newStatus },
    });
  }
}
