import { Injectable, NotFoundException } from '@nestjs/common';
import { Label } from '../../domain/entities/label.entity';
import { ILabelRepository } from '../../domain/repositories/label.repository';
import { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository';

@Injectable()
export class GetTaskLabelsUseCase {
  constructor(
    private readonly labelRepository: ILabelRepository,
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(taskId: string): Promise<Label[]> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.labelRepository.findByTask(taskId);
  }
}
