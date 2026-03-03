import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/comment.repository';
import { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(
    content: string,
    taskId: string,
    authorId: string,
  ): Promise<Comment> {
    if (content.length < 1) {
      throw new Error('Comment content cannot be empty');
    }

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.commentRepository.create({
      content,
      taskId,
      authorId,
    });
  }
}
