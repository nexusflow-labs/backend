import { Injectable } from '@nestjs/common';
import { ActivityLog } from '../../domain/entities/activity-log.entity';
import {
  IActivityLogRepository,
  ActivityLogFilters,
} from '../../domain/repositories/activity-log.repository';
import { EntityType } from '../../domain/enums/entity-type.enum';

@Injectable()
export class ListActivitiesUseCase {
  constructor(private readonly activityLogRepository: IActivityLogRepository) {}

  async execute(filters: ActivityLogFilters): Promise<ActivityLog[]> {
    return this.activityLogRepository.findByFilters(filters);
  }

  async executeByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<ActivityLog[]> {
    return this.activityLogRepository.findByEntity(entityType, entityId);
  }
}
