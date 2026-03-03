import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository';

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

@Injectable()
export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string, input: UpdateTaskInput): Promise<Task> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (input.title !== undefined) {
      task.updateTitle(input.title);
    }

    if (input.description !== undefined) {
      task.updateDescription(input.description);
    }

    if (input.status !== undefined) {
      task.updateStatus(input.status);
    }

    if (input.priority !== undefined) {
      task.updatePriority(input.priority);
    }

    if (input.dueDate !== undefined) {
      task.updateDueDate(input.dueDate);
    }

    await this.taskRepository.save(task);
    return task;
  }
}
