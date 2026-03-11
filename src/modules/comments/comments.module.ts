import { Module } from '@nestjs/common';
import { CommentsController } from './presentation/comments.controller';
import { ICommentRepository } from './domain/repositories/comment.repository';
import { PrismaCommentRepository } from './infrastructure/persistence/prisma-comment.repository';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { ListCommentsUseCase } from './application/use-cases/list-comments.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { ITaskRepository } from '../tasks/domain/repositories/task.repository';
import { TasksModule } from '../tasks/tasks.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { ActivityLogService } from '../activity-logs/application/services/activity-log.service';
import {
  RealtimeModule,
  WebsocketEmitterService,
} from 'src/infrastructure/realtime';

@Module({
  imports: [ActivityLogsModule, TasksModule, RealtimeModule],
  controllers: [CommentsController],
  providers: [
    {
      provide: ICommentRepository,
      useClass: PrismaCommentRepository,
    },
    {
      provide: CreateCommentUseCase,
      inject: [
        ICommentRepository,
        ITaskRepository,
        ActivityLogService,
        WebsocketEmitterService,
      ],
      useFactory: (
        commentRepo: ICommentRepository,
        taskRepo: ITaskRepository,
        activityLogService: ActivityLogService,
        wsEmitter: WebsocketEmitterService,
      ) =>
        new CreateCommentUseCase(
          commentRepo,
          taskRepo,
          activityLogService,
          wsEmitter,
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
  exports: [ICommentRepository],
})
export class CommentsModule {}
