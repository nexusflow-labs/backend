import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ILabelRepository } from '../../domain/repositories/label.repository';
import { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository';
import { IProjectRepository } from 'src/modules/projects/domain/repositories/project.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class AddLabelToTaskUseCase {
  constructor(
    private readonly labelRepository: ILabelRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
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

    const project = await this.projectRepository.findById(task.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (label.workspaceId !== project.workspaceId) {
      throw new BadRequestException(
        'Label must belong to the same workspace as the task',
      );
    }

    const isAttached = await this.labelRepository.isLabelAttachedToTask(
      taskId,
      labelId,
    );
    if (isAttached) {
      throw new ConflictException('Label is already attached to this task');
    }

    await this.labelRepository.addLabelToTask(taskId, labelId);

    await this.activityLogService.logUpdate(EntityType.TASK, taskId, userId, {
      action: 'LABEL_ADDED',
      labelId,
      labelName: label.name,
    });
  }
}
