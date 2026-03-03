import { Injectable } from '@nestjs/common';
import {
  ITaskRepository,
  TaskFilters,
  CreateTaskData,
} from '../../domain/repositories/task.repository';
import { Task, TaskPriority } from '../../domain/entities/task.entity';
import { TaskMapper } from '../mappers/task.mapper';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTaskData): Promise<Task> {
    const result = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || TaskPriority.MEDIUM,
        dueDate: data.dueDate,
        projectId: data.projectId,
        creatorId: data.creatorId,
        parentId: data.parentId,
      },
    });

    return TaskMapper.toEntity(result);
  }

  async save(task: Task): Promise<void> {
    await this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        position: task.position,
        dueDate: task.dueDate,
        assigneeId: task.assigneeId,
      },
    });
  }

  async findById(id: string): Promise<Task | null> {
    const result = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
    });

    if (!result) {
      return null;
    }

    return TaskMapper.toEntity(result);
  }

  async findByProject(
    projectId: string,
    filters?: TaskFilters,
  ): Promise<Task[]> {
    const where: any = { projectId, deletedAt: null };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }
    if (filters?.rootOnly) {
      where.parentId = null;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });

    return tasks.map((t) => TaskMapper.toEntity(t));
  }

  async findByParent(parentId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { parentId, deletedAt: null },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });

    return tasks.map((t) => TaskMapper.toEntity(t));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.softDelete('task', id);
  }
}
