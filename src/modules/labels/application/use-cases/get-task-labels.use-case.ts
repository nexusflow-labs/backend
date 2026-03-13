import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Label } from '../../domain/entities/label.entity';
import { ILabelRepository } from '../../domain/repositories/label.repository';
import { ITaskRepository } from 'src/modules/tasks/domain/repositories/task.repository';

@Injectable()
export class GetTaskLabelsUseCase {
  constructor(
    @Inject(ILabelRepository)
    private readonly labelRepository: ILabelRepository,
    @Inject(ITaskRepository)
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
