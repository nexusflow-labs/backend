import { Task, TaskPriority, TaskStatus } from '../entities/task.entity';
import { PaginatedResult } from 'src/infrastructure/common/pagination';

export interface CreateTaskData {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: Date | null;
  projectId: string;
  creatorId: string;
  parentId?: string | null;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  rootOnly?: boolean;
}

export interface TaskQueryFilters {
  // Basic filters
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  rootOnly?: boolean;

  // Extended filters
  creatorId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
  search?: string;
  labelIds?: string[];
  overdue?: boolean;
}

export interface TaskPaginationParams {
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export abstract class ITaskRepository {
  abstract create(data: CreateTaskData): Promise<Task>;
  abstract save(task: Task): Promise<void>;
  abstract findById(id: string): Promise<Task | null>;
  abstract findByProject(
    projectId: string,
    filters?: TaskFilters,
  ): Promise<Task[]>;
  abstract findByProjectPaginated(
    projectId: string,
    filters: TaskQueryFilters,
    pagination: TaskPaginationParams,
  ): Promise<PaginatedResult<Task>>;
  abstract countByProject(
    projectId: string,
    filters?: TaskQueryFilters,
  ): Promise<number>;
  abstract findByParent(parentId: string): Promise<Task[]>;
  abstract delete(id: string): Promise<void>;
}
