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

@Module({
  imports: [ActivityLogsModule, TasksModule],
  controllers: [CommentsController],
  providers: [
    {
      provide: ICommentRepository,
      useClass: PrismaCommentRepository,
    },
    {
      provide: CreateCommentUseCase,
      inject: [ICommentRepository, ITaskRepository, ActivityLogService],
      useFactory: (
        commentRepo: ICommentRepository,
        taskRepo: ITaskRepository,
        activityLogService: ActivityLogService,
      ) => new CreateCommentUseCase(commentRepo, taskRepo, activityLogService),
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
      inject: [ICommentRepository, ActivityLogService],
      useFactory: (
        repo: ICommentRepository,
        activityLogService: ActivityLogService,
      ) => new UpdateCommentUseCase(repo, activityLogService),
    },
    {
      provide: DeleteCommentUseCase,
      inject: [ICommentRepository, ActivityLogService],
      useFactory: (
        repo: ICommentRepository,
        activityLogService: ActivityLogService,
      ) => new DeleteCommentUseCase(repo, activityLogService),
    },
  ],
  exports: [ICommentRepository],
})
export class CommentsModule {}
