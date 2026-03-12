import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/entities/notification.enum';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

export class NotificationResponseDto {
  id: string;
  type: NotificationType;
  entityType: EntityType;
  entityId: string;
  userId: string;
  workspaceId?: string;
  actorId?: string;
  title: string;
  message?: string;
  metadata?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;

  static fromEntity(entity: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = entity.id;
    dto.type = entity.type;
    dto.entityType = entity.entityType;
    dto.entityId = entity.entityId;
    dto.userId = entity.userId;
    dto.workspaceId = entity.workspaceId;
    dto.actorId = entity.actorId;
    dto.title = entity.title;
    dto.message = entity.message;
    dto.metadata = entity.metadata;
    dto.isRead = entity.isRead;
    dto.readAt = entity.readAt;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static fromEntities(entities: Notification[]): NotificationResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}

export class UnreadCountResponseDto {
  count: number;

  static from(count: number): UnreadCountResponseDto {
    const dto = new UnreadCountResponseDto();
    dto.count = count;
    return dto;
  }
}
