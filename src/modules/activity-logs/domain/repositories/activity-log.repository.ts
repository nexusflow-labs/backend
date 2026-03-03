import { ActivityLog } from '../entities/activity-log.entity';
import { ActivityAction } from '../enums/activity-action.enum';
import { EntityType } from '../enums/entity-type.enum';

export interface CreateActivityLogData {
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  userId: string;
  metadata?: Record<string, any> | null;
}

export interface ActivityLogFilters {
  entityType?: EntityType;
  entityId?: string;
  userId?: string;
}

export abstract class IActivityLogRepository {
  abstract create(data: CreateActivityLogData): Promise<ActivityLog>;
  abstract findByFilters(filters: ActivityLogFilters): Promise<ActivityLog[]>;
  abstract findByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<ActivityLog[]>;
}
