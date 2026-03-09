import { Injectable, NotFoundException } from '@nestjs/common';
import { ILabelRepository } from '../../domain/repositories/label.repository';
import { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class RemoveLabelFromTaskUseCase {
  constructor(
    private readonly labelRepository: ILabelRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(
    taskId: string,
    labelId: string,
    userId: string,
  ): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const label = await this.labelRepository.findById(labelId);
    if (!label) {
      throw new NotFoundException('Label not found');
    }

    const isAttached = await this.labelRepository.isLabelAttachedToTask(
      taskId,
      labelId,
    );
    if (!isAttached) {
      throw new NotFoundException('Label is not attached to this task');
    }

    await this.labelRepository.removeLabelFromTask(taskId, labelId);

    await this.activityLogService.logUpdate(EntityType.TASK, taskId, userId, {
      action: 'LABEL_REMOVED',
      labelId,
      labelName: label.name,
    });
  }
}
