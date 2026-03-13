import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/repositories/notification.repository';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class MarkAsReadUseCase {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(notificationId: string, userId: string): Promise<Notification> {
    const notification =
      await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found`,
      );
    }

    if (notification.userId !== userId) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found`,
      );
    }

    if (notification.isRead) {
      return notification;
    }

    return this.notificationRepository.maskAsRead(notificationId);
  }
}
