import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(
    id: string,
    input: UpdateTaskInput,
    userId: string,
  ): Promise<Task> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const oldStatus = task.status;
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    if (input.title !== undefined && input.title !== task.title) {
      changes.title = { old: task.title, new: input.title };
      task.updateTitle(input.title);
    }

    if (
      input.description !== undefined &&
      input.description !== task.description
    ) {
      changes.description = { old: task.description, new: input.description };
      task.updateDescription(input.description);
    }

    if (input.status !== undefined && input.status !== task.status) {
      changes.status = { old: task.status, new: input.status };
      task.updateStatus(input.status);
    }

    if (input.priority !== undefined && input.priority !== task.priority) {
      changes.priority = { old: task.priority, new: input.priority };
      task.updatePriority(input.priority);
    }

    if (input.dueDate !== undefined) {
      const oldDueDate = task.dueDate?.toISOString() ?? null;
      const newDueDate = input.dueDate?.toISOString() ?? null;
      if (oldDueDate !== newDueDate) {
        changes.dueDate = { old: oldDueDate, new: newDueDate };
        task.updateDueDate(input.dueDate);
      }
    }

    await this.taskRepository.save(task);

    // Log status change separately if status was updated
    if (input.status !== undefined && input.status !== oldStatus) {
      await this.activityLogService.logStatusChange(
        id,
        userId,
        oldStatus,
        input.status,
      );
    } else if (Object.keys(changes).length > 0) {
      await this.activityLogService.logUpdate(EntityType.TASK, id, userId, {
        changes,
      });
    }

    return task;
  }
}
