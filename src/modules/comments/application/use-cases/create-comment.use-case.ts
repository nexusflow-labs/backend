import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/comment.repository';
import { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
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

    const comment = await this.commentRepository.create({
      content,
      taskId,
      authorId,
    });

    await this.activityLogService.logComment(taskId, comment.id, authorId);

    this.wsEmitter.emitToTask(taskId, RealtimeEvents.COMMENT_CREATED, {
      comment: {
        id: comment.id,
        content: comment.content,
        taskId: comment.taskId,
        authorId: comment.authorId,
        createdAt: comment.createdAt,
      },
    });

    return comment;
  }
}
