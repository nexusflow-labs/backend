import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/entities/notification.enum';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import { Notification as PrismaNotification } from 'generated/prisma/browser';

export class NotificationMapper {
  static toEntity(raw: PrismaNotification): Notification {
    return Notification.reconstitute({
      id: raw.id,
      type: raw.type as NotificationType,
      entityType: raw.entityType as EntityType,
      entityId: raw.entityId ?? '',
      userId: raw.userId,
      workspaceId: raw.workspaceId ?? undefined,
      actorId: raw.actorId ?? undefined,
      title: raw.title,
      message: raw.message ?? undefined,
      metadata: raw.metadata as Record<string, any> | null,
      createdAt: raw.createdAt,
      readAt: raw.readAt ?? undefined,
    });
  }

  static toEntities(rawList: PrismaNotification[]): Notification[] {
    return rawList.map((raw) => this.toEntity(raw));
  }
}
