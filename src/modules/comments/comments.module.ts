import { Module } from '@nestjs/common';
import { CommentsController } from './presentation/comments.controller';
import { ICommentRepository } from './domain/repositories/comment.repository';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { ListCommentsUseCase } from './application/use-cases/list-comments.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { ITaskRepository } from '../tasks/domain/repositories/task.repository';
import { IProjectRepository } from '../projects/domain/repositories/project.repository';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { ActivityLogService } from '../activity-logs/application/services/activity-log.service';
import {
  RealtimeModule,
  WebsocketEmitterService,
} from 'src/infrastructure/realtime';
import { NotificationsModule } from '../notifications/notifications.module';
import { CreateNotificationUseCase } from '../notifications/applications/use-case/create-notification.use-case';

@Module({
  imports: [ActivityLogsModule, RealtimeModule, NotificationsModule],
  controllers: [CommentsController],
  providers: [
    {
      provide: CreateCommentUseCase,
      inject: [
        ICommentRepository,
        ITaskRepository,
        IProjectRepository,
        ActivityLogService,
        WebsocketEmitterService,
        CreateNotificationUseCase,
      ],
      useFactory: (
        commentRepo: ICommentRepository,
        taskRepo: ITaskRepository,
        projectRepo: IProjectRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
        createNotificationUseCase: CreateNotificationUseCase,
      ) =>
        new CreateCommentUseCase(
          commentRepo,
          taskRepo,
          projectRepo,
          activityLogService,
          wsEmitter,
          createNotificationUseCase,
        ),
    },
    {
      provide: ListCommentsUseCase,
      inject: [ICommentRepository, ITaskRepository],
      useFactory: (
        commentRepo: ICommentRepository,
        taskRepo: ITaskRepository,
      ) => new ListCommentsUseCase(commentRepo, taskRepo),
    },
    {
      provide: UpdateCommentUseCase,
      inject: [ICommentRepository, ActivityLogService, WebsocketEmitterService],
      useFactory: (
        repo: ICommentRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) => new UpdateCommentUseCase(repo, activityLogService, wsEmitter),
    },
    {
      provide: DeleteCommentUseCase,
      inject: [ICommentRepository, ActivityLogService, WebsocketEmitterService],
      useFactory: (
        repo: ICommentRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) => new DeleteCommentUseCase(repo, activityLogService, wsEmitter),
    },
  ],
})
export class CommentsModule {}
