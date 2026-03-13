import { Module } from '@nestjs/common';
import { NotificationsController } from './presentation/notifications.controller';
import { CreateNotificationUseCase } from './applications/use-case/create-notification.use-case';
import { ListNotificationsUseCase } from './applications/use-case/list-notifications.use-case';
import { MarkAsReadUseCase } from './applications/use-case/mark-as-read.use-case';
import { MaskAllAsReadUseCase } from './applications/use-case/mask-all-as-read.use-case';
import { CountUnreadUseCase } from './applications/use-case/count-unread.use-case';
import { RealtimeModule } from 'src/infrastructure/realtime';

@Module({
  imports: [RealtimeModule],
  controllers: [NotificationsController],
  providers: [
    CreateNotificationUseCase,
    ListNotificationsUseCase,
    MarkAsReadUseCase,
    MaskAllAsReadUseCase,
    CountUnreadUseCase,
  ],
  exports: [CreateNotificationUseCase],
})
export class NotificationsModule {}
