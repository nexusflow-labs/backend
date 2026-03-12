import { Injectable } from '@nestjs/common';
import {
  INotificationRepository,
  FilterType,
} from '../../domain/repositories/notification.repository';
import { Notification } from '../../domain/entities/notification.entity';
import {
  CursorPaginationParams,
  PaginatedResult,
} from 'src/infrastructure/common/pagination';

@Injectable()
export class ListNotificationsUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(
    userId: string,
    filter: FilterType = FilterType.all,
    pagination?: CursorPaginationParams,
  ): Promise<PaginatedResult<Notification>> {
    return this.notificationRepository.listByUser(userId, filter, pagination);
  }
}
