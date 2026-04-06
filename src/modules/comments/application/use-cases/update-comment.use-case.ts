import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Comment } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/comment.repository';
import { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository';
import { IProjectRepository } from 'src/modules/projects/domain/repositories/project.repository';
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
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
  ) {}

  async execute(id: string, content: string, userId: string): Promise<Comment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const task = await this.taskRepository.findById(comment.taskId);
    const project = task
      ? await this.projectRepository.findById(task.projectId)
      : null;
    const workspaceId = project?.workspaceId ?? '';

    const oldContent = comment.content;
    comment.updateContent(content);
    await this.commentRepository.save(comment);

    await this.activityLogService.logUpdate(
      EntityType.COMMENT,
      id,
      userId,
      workspaceId,
      {
        taskId: comment.taskId,
        oldContent,
        newContent: content,
      },
    );

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
