import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentWithUser } from '../../domain/entities/comment-with-user.entity';
import { ICommentRepository } from '../../domain/repositories/comment.repository';
import { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository';

@Injectable()
export class ListCommentsUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(taskId: string): Promise<CommentWithUser[]> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.commentRepository.findByTaskWithUser(taskId);
  }
}
