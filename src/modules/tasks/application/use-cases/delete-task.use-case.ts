import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ITaskRepository } from '../../domain/repositories/task.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const projectId = task.projectId;

    await this.taskRepository.delete(id);

    await this.activityLogService.logDelete(EntityType.TASK, id, userId, {
      title: task.title,
      projectId,
    });

    this.wsEmitter.emitToProject(projectId, RealtimeEvents.TASK_DELETED, {
      taskId: id,
      deletedBy: userId,
    });
  }
}
