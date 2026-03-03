import { Injectable } from '@nestjs/common';
import { ActivityLog } from '../../domain/entities/activity-log.entity';
import {
  IActivityLogRepository,
  ActivityLogFilters,
  ActivityLogPaginationParams,
} from '../../domain/repositories/activity-log.repository';
import { EntityType } from '../../domain/enums/entity-type.enum';
import { PaginatedResult } from 'src/infrastructure/common/pagination';

@Injectable()
export class ListActivitiesUseCase {
  constructor(private readonly activityLogRepository: IActivityLogRepository) {}

  async execute(filters: ActivityLogFilters): Promise<ActivityLog[]> {
    return this.activityLogRepository.findByFilters(filters);
  }

  async executePaginated(
    filters: ActivityLogFilters,
    pagination: ActivityLogPaginationParams,
  ): Promise<PaginatedResult<ActivityLog>> {
    return this.activityLogRepository.findByFiltersPaginated(
      filters,
      pagination,
    );
  }

  async executeByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<ActivityLog[]> {
    return this.activityLogRepository.findByEntity(entityType, entityId);
  }

  async executeByEntityPaginated(
    entityType: EntityType,
    entityId: string,
    pagination: ActivityLogPaginationParams,
  ): Promise<PaginatedResult<ActivityLog>> {
    return this.activityLogRepository.findByEntityPaginated(
      entityType,
      entityId,
      pagination,
    );
  }
}
