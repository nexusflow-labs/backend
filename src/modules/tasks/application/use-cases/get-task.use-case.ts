import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository';

@Injectable()
export class GetTaskUseCase {
  constructor(
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }
}
