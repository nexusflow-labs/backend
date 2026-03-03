import { ActivityLog } from '../entities/activity-log.entity';
import { ActivityAction } from '../enums/activity-action.enum';
import { EntityType } from '../enums/entity-type.enum';
import { PaginatedResult } from 'src/infrastructure/common/pagination';

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
  action?: ActivityAction;
  fromDate?: Date;
  toDate?: Date;
}

export interface ActivityLogPaginationParams {
  page: number;
  pageSize: number;
}

export abstract class IActivityLogRepository {
  abstract create(data: CreateActivityLogData): Promise<ActivityLog>;
  abstract findByFilters(filters: ActivityLogFilters): Promise<ActivityLog[]>;
  abstract findByFiltersPaginated(
    filters: ActivityLogFilters,
    pagination: ActivityLogPaginationParams,
  ): Promise<PaginatedResult<ActivityLog>>;
  abstract findByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<ActivityLog[]>;
  abstract findByEntityPaginated(
    entityType: EntityType,
    entityId: string,
    pagination: ActivityLogPaginationParams,
  ): Promise<PaginatedResult<ActivityLog>>;
}
