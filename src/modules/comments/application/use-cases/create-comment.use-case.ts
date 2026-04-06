import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Comment } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/comment.repository';
import { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository';
import { IProjectRepository } from 'src/modules/projects/domain/repositories/project.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';
import { CreateNotificationUseCase } from 'src/modules/notifications/applications/use-case/create-notification.use-case';
import { NotificationType } from 'src/modules/notifications/domain/entities/notification.enum';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository,
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
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

    const project = await this.projectRepository.findById(task.projectId);

    await this.activityLogService.logComment(
      taskId,
      comment.id,
      authorId,
      project?.workspaceId ?? '',
    );

    this.wsEmitter.emitToTask(taskId, RealtimeEvents.COMMENT_CREATED, {
      comment: {
        id: comment.id,
        content: comment.content,
        taskId: comment.taskId,
        authorId: comment.authorId,
        createdAt: comment.createdAt,
      },
    });

    if (task.assigneeId && task.assigneeId !== authorId) {
      await this.createNotificationUseCase.execute(
        task.assigneeId,
        NotificationType.COMMENT_ADDED,
        EntityType.COMMENT,
        comment.id,
        `New comment on task: ${task.title}`,
        authorId,
        project?.workspaceId,
        comment.content.substring(0, 100),
        { taskId, commentId: comment.id },
      );
    }

    return comment;
  }
}
