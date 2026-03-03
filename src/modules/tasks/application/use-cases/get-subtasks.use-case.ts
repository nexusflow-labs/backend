import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository';

@Injectable()
export class GetSubtasksUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(parentId: string): Promise<Task[]> {
    const parentTask = await this.taskRepository.findById(parentId);
    if (!parentTask) {
      throw new NotFoundException('Parent task not found');
    }

    return this.taskRepository.findByParent(parentId);
  }
}
