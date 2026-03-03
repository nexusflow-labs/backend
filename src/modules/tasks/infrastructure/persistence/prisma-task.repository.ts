import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import {
  ITaskRepository,
  TaskFilters,
  CreateTaskData,
  TaskQueryFilters,
  TaskPaginationParams,
} from '../../domain/repositories/task.repository';
import {
  Task,
  TASK_SORT_FIELDS,
  TaskPriority,
  TaskSortField,
  TaskStatus,
} from '../../domain/entities/task.entity';
import { TaskMapper } from '../mappers/task.mapper';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  PaginatedResult,
  buildOffsetPagination,
  createOffsetPaginatedResult,
} from 'src/infrastructure/common/pagination';

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
    const where: Prisma.TaskWhereInput = { projectId, deletedAt: null };

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

  async findByProjectPaginated(
    projectId: string,
    filters: TaskQueryFilters,
    pagination: TaskPaginationParams,
  ): Promise<PaginatedResult<Task>> {
    const where = this.buildWhereClause(projectId, filters);
    const orderBy = this.buildOrderBy(
      pagination.sortBy,
      pagination.sortDirection,
    );
    const { skip, take } = buildOffsetPagination({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    const [tasks, totalItems] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.task.count({ where }),
    ]);

    const entities = tasks.map((t) => TaskMapper.toEntity(t));

    return createOffsetPaginatedResult(
      entities,
      totalItems,
      pagination.page,
      pagination.pageSize,
    );
  }

  async countByProject(
    projectId: string,
    filters?: TaskQueryFilters,
  ): Promise<number> {
    const where = this.buildWhereClause(projectId, filters ?? {});
    return this.prisma.task.count({ where });
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

  private buildWhereClause(
    projectId: string,
    filters: TaskQueryFilters,
  ): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = { projectId, deletedAt: null };
    const andConditions: Prisma.TaskWhereInput[] = [];

    // Basic filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }
    if (filters.rootOnly) {
      where.parentId = null;
    }

    // Extended filters
    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }

    // Due date range
    if (filters.dueDateFrom || filters.dueDateTo) {
      const dueDateFilter: Prisma.DateTimeNullableFilter = {};
      if (filters.dueDateFrom) {
        dueDateFilter.gte = filters.dueDateFrom;
      }
      if (filters.dueDateTo) {
        dueDateFilter.lte = filters.dueDateTo;
      }
      where.dueDate = dueDateFilter;
    }

    // Created date range
    if (filters.createdFrom || filters.createdTo) {
      const createdAtFilter: Prisma.DateTimeFilter = {};
      if (filters.createdFrom) {
        createdAtFilter.gte = filters.createdFrom;
      }
      if (filters.createdTo) {
        createdAtFilter.lte = filters.createdTo;
      }
      where.createdAt = createdAtFilter;
    }

    // Search filter (title + description)
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.trim();
      andConditions.push({
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      });
    }

    // Overdue filter
    if (filters.overdue) {
      andConditions.push({
        dueDate: { lt: new Date() },
        status: { not: TaskStatus.DONE },
      });
    }

    // Label filter (tasks that have any of the specified labels)
    if (filters.labelIds && filters.labelIds.length > 0) {
      andConditions.push({
        labels: {
          some: {
            labelId: { in: filters.labelIds },
          },
        },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  private buildOrderBy(
    sortBy: string,
    sortDirection: 'asc' | 'desc',
  ): Prisma.TaskOrderByWithRelationInput[] {
    // Validate sort field, default to createdAt
    const validSortBy = TASK_SORT_FIELDS.includes(sortBy as TaskSortField)
      ? sortBy
      : 'createdAt';

    return [{ [validSortBy]: sortDirection }];
  }
}
