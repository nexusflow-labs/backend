import { Module } from '@nestjs/common';
import { NotificationsController } from './presentation/notifications.controller';
import { INotificationRepository } from './domain/repositories/notification.repository';
import { CreateNotificationUseCase } from './applications/use-case/create-notification.use-case';
import { ListNotificationsUseCase } from './applications/use-case/list-notifications.use-case';
import { MarkAsReadUseCase } from './applications/use-case/mark-as-read.use-case';
import { MaskAllAsReadUseCase } from './applications/use-case/mask-all-as-read.use-case';
import { CountUnreadUseCase } from './applications/use-case/count-unread.use-case';
import {
  RealtimeModule,
  WebsocketEmitterService,
} from 'src/infrastructure/realtime';

@Module({
  imports: [RealtimeModule],
  controllers: [NotificationsController],
  providers: [
    {
      provide: CreateNotificationUseCase,
      inject: [INotificationRepository, WebsocketEmitterService],
      useFactory: (
        repo: INotificationRepository,
        wsEmitter: WebsocketEmitterService,
      ) => new CreateNotificationUseCase(repo, wsEmitter),
    },
    {
      provide: ListNotificationsUseCase,
      inject: [INotificationRepository],
      useFactory: (repo: INotificationRepository) =>
        new ListNotificationsUseCase(repo),
    },
    {
      provide: MarkAsReadUseCase,
      inject: [INotificationRepository],
      useFactory: (repo: INotificationRepository) =>
        new MarkAsReadUseCase(repo),
    },
    {
      provide: MaskAllAsReadUseCase,
      inject: [INotificationRepository],
      useFactory: (repo: INotificationRepository) =>
        new MaskAllAsReadUseCase(repo),
    },
    {
      provide: CountUnreadUseCase,
      inject: [INotificationRepository],
      useFactory: (repo: INotificationRepository) =>
        new CountUnreadUseCase(repo),
    },
  ],
  exports: [CreateNotificationUseCase],
})
export class NotificationsModule {}
