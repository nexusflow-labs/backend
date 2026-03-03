import { Injectable } from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import {
  ITaskRepository,
  TaskFilters,
} from '../../domain/repositories/task.repository';

@Injectable()
export class ListTasksUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(projectId: string, filters?: TaskFilters): Promise<Task[]> {
    return this.taskRepository.findByProject(projectId, filters);
  }
}
