import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/comment.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class UpdateCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly activityLogService: ActivityLogService,
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

    return comment;
  }
}
