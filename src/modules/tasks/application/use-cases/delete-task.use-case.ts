import { Injectable, NotFoundException } from '@nestjs/common';
import { ITaskRepository } from '../../domain/repositories/task.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskRepository.delete(id);

    await this.activityLogService.logDelete(EntityType.TASK, id, userId, {
      title: task.title,
      projectId: task.projectId,
    });
  }
}
