import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../domain/entities/task.entity';

export class TaskResponseDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  projectId: string;
  assigneeId: string | null;
  creatorId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: Task): TaskResponseDto {
    const dto = new TaskResponseDto();
    dto.id = entity.id;
    dto.title = entity.title;
    dto.description = entity.description ?? null;
    dto.status = entity.status;
    dto.priority = entity.priority;
    dto.dueDate = entity.dueDate ?? null;
    dto.projectId = entity.projectId;
    dto.assigneeId = entity.assigneeId ?? null;
    dto.creatorId = entity.creatorId;
    dto.parentId = entity.parentId ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static fromEntities(entities: Task[]): TaskResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
