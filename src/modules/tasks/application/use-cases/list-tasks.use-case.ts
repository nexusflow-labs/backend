import { Injectable } from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import {
  ITaskRepository,
  TaskFilters,
  TaskQueryFilters,
  TaskPaginationParams,
} from '../../domain/repositories/task.repository';
import { PaginatedResult } from 'src/infrastructure/common/pagination';

@Injectable()
export class ListTasksUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(projectId: string, filters?: TaskFilters): Promise<Task[]> {
    return this.taskRepository.findByProject(projectId, filters);
  }

  async executePaginated(
    projectId: string,
    filters: TaskQueryFilters,
    pagination: TaskPaginationParams,
  ): Promise<PaginatedResult<Task>> {
    return this.taskRepository.findByProjectPaginated(
      projectId,
      filters,
      pagination,
    );
  }
}
