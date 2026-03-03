import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../domain/entities/task.entity';
import { Task as PrismaTask } from 'generated/prisma/browser';

export class TaskMapper {
  static toEntity(raw: PrismaTask): Task {
    return Task.reconstitute({
      id: raw.id,
      title: raw.title,
      description: raw.description,
      status: raw.status as TaskStatus,
      priority: raw.priority as TaskPriority,
      position: raw.position,
      dueDate: raw.dueDate,
      projectId: raw.projectId,
      assigneeId: raw.assigneeId,
      creatorId: raw.creatorId,
      parentId: raw.parentId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }
}
