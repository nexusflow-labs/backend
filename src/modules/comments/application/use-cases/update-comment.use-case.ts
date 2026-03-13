import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Comment } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/comment.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';

@Injectable()
export class UpdateCommentUseCase {
  constructor(
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
  ) {}

  async execute(id: string, content: string, userId: string): Promise<Comment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const oldContent = comment.content;
    comment.updateContent(content);
    await this.commentRepository.save(comment);

    await this.activityLogService.logUpdate(EntityType.COMMENT, id, userId, {
      taskId: comment.taskId,
      oldContent,
      newContent: content,
    });

    this.wsEmitter.emitToTask(comment.taskId, RealtimeEvents.COMMENT_UPDATED, {
      comment: {
        id: comment.id,
        content: comment.content,
        updatedAt: comment.updatedAt,
      },
      updatedBy: userId,
    });

    return comment;
  }
}
