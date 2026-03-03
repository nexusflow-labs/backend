import { ActivityLog } from '../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../domain/enums/activity-action.enum';
import { EntityType } from '../../domain/enums/entity-type.enum';

export class ActivityLogResponseDto {
  id: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  userId: string;
  metadata: Record<string, any> | null;
  createdAt: Date;

  static fromEntity(entity: ActivityLog): ActivityLogResponseDto {
    const dto = new ActivityLogResponseDto();
    dto.id = entity.id;
    dto.action = entity.action;
    dto.entityType = entity.entityType;
    dto.entityId = entity.entityId;
    dto.userId = entity.userId;
    dto.metadata = entity.metadata ?? null;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static fromEntities(entities: ActivityLog[]): ActivityLogResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
