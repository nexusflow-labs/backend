import { Injectable } from '@nestjs/common';
import { INotificationRepository } from '../../domain/repositories/notification.repository';

@Injectable()
export class CountUnreadUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }
}
