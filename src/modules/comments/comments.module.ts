import { Module } from '@nestjs/common';
import { CommentsController } from './presentation/comments.controller';
import { ICommentRepository } from './domain/repositories/comment.repository';
import { PrismaCommentRepository } from './infrastructure/persistence/prisma-comment.repository';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { ListCommentsUseCase } from './application/use-cases/list-comments.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { ITaskRepository } from '../tasks/domain/repositories/task.repository';
import { PrismaTaskRepository } from '../tasks/infrastructure/persistence/prisma-task.repository';

@Module({
  controllers: [CommentsController],
  providers: [
    {
      provide: ICommentRepository,
      useClass: PrismaCommentRepository,
    },
    {
      provide: ITaskRepository,
      useClass: PrismaTaskRepository,
    },
    {
      provide: CreateCommentUseCase,
      inject: [ICommentRepository, ITaskRepository],
      useFactory: (
        commentRepo: ICommentRepository,
        taskRepo: ITaskRepository,
      ) => new CreateCommentUseCase(commentRepo, taskRepo),
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
      inject: [ICommentRepository],
      useFactory: (repo: ICommentRepository) => new UpdateCommentUseCase(repo),
    },
    {
      provide: DeleteCommentUseCase,
      inject: [ICommentRepository],
      useFactory: (repo: ICommentRepository) => new DeleteCommentUseCase(repo),
    },
  ],
  exports: [ICommentRepository],
})
export class CommentsModule {}
