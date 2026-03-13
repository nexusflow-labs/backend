import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CommentWithUser } from '../../domain/entities/comment-with-user.entity';
import {
  ICommentRepository,
  CommentPaginationParams,
} from '../../domain/repositories/comment.repository';
import { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository';
import { PaginatedResult } from 'src/infrastructure/common/pagination';

@Injectable()
export class ListCommentsUseCase {
  constructor(
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository,
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(taskId: string): Promise<CommentWithUser[]> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.commentRepository.findByTaskWithUser(taskId);
  }

  async executePaginated(
    taskId: string,
    pagination: CommentPaginationParams,
  ): Promise<PaginatedResult<CommentWithUser>> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.commentRepository.findByTaskWithUserPaginated(
      taskId,
      pagination,
    );
  }
}
