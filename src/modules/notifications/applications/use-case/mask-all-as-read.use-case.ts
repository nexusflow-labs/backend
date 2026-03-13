import { FilterType } from './../../domain/repositories/notification.repository';
import { INotificationRepository } from '../../domain/repositories/notification.repository';
import { Injectable, Inject } from '@nestjs/common';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class MaskAllAsReadUseCase {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    const unreadNotifications = await this.notificationRepository.listByUser(
      userId,
      FilterType.unread,
    );

    if (unreadNotifications.items.length === 0) {
      return;
    }

    const notificationIds = unreadNotifications.items.map((item) => item.id);

    await this.notificationRepository.maskAllAsRead(notificationIds);
  }
}
