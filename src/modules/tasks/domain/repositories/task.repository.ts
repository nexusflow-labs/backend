import { Task, TaskPriority } from '../entities/task.entity';

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

export abstract class ITaskRepository {
  abstract create(data: CreateTaskData): Promise<Task>;
  abstract save(task: Task): Promise<void>;
  abstract findById(id: string): Promise<Task | null>;
  abstract findByProject(
    projectId: string,
    filters?: TaskFilters,
  ): Promise<Task[]>;
  abstract findByParent(parentId: string): Promise<Task[]>;
  abstract delete(id: string): Promise<void>;
}
