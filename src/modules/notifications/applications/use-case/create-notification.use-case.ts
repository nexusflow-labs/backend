import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import { NotificationType } from '../../domain/entities/notification.enum';
import { INotificationRepository } from '../../domain/repositories/notification.repository';
import { Injectable } from '@nestjs/common';
import { Notification } from '../../domain/entities/notification.entity';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly wsEmitter?: WebsocketEmitterService,
  ) {}

  async execute(
    userId: string,
    type: NotificationType,
    entityType: EntityType,
    entityId: string,
    title: string,
    actorId?: string,
    workspaceId?: string,
    message?: string,
    metadata?: Record<string, unknown> | null,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.create({
      userId,
      actorId,
      type,
      entityType,
      entityId,
      workspaceId,
      title,
      message,
      metadata,
    });

    if (this.wsEmitter) {
      this.wsEmitter.emitToUser(userId, RealtimeEvents.NOTIFICATION_RECEIVED, {
        notification: {
          id: notification.id,
          type: notification.type,
          entityType: notification.entityType,
          entityId: notification.entityId,
          title: notification.title,
          message: notification.message,
          actorId: notification.actorId,
          workspaceId: notification.workspaceId,
          metadata: notification.metadata,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        },
      });
    }

    return notification;
  }
}
