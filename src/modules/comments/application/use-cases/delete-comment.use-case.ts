import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ICommentRepository } from '../../domain/repositories/comment.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';

@Injectable()
export class DeleteCommentUseCase {
  constructor(
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const taskId = comment.taskId;
    await this.commentRepository.delete(id);

    await this.activityLogService.logDelete(EntityType.COMMENT, id, userId, {
      taskId,
    });

    this.wsEmitter.emitToTask(taskId, RealtimeEvents.COMMENT_DELETED, {
      commentId: id,
      deletedBy: userId,
    });
  }
}
