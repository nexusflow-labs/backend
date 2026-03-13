import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/repositories/notification.repository';

@Injectable()
export class CountUnreadUseCase {
  constructor(
    @Inject(INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }
}
