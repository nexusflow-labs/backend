import { Injectable } from '@nestjs/common';
import {
  INotificationRepository,
  CreateNotificationData,
  FilterType,
} from '../../domain/repositories/notification.repository';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationMapper } from '../mappers/notification.mapper';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  CursorPaginationParams,
  PaginatedResult,
  buildCursorPagination,
  createCursorPaginatedResult,
} from 'src/infrastructure/common/pagination';
import type { Prisma } from 'generated/prisma/browser';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    const result = await this.prisma.notification.create({
      data: {
        type: data.type,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId,
        workspaceId: data.workspaceId,
        actorId: data.actorId,
        title: data.title,
        message: data.message,
        metadata: (data.metadata as Prisma.InputJsonValue) ?? undefined,
      },
    });

    return NotificationMapper.toEntity(result);
  }

  async findById(id: string): Promise<Notification | null> {
    const result = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!result) {
      return null;
    }

    return NotificationMapper.toEntity(result);
  }

  async listByUser(
    userId: string,
    filter: FilterType,
    pagination?: CursorPaginationParams,
  ): Promise<PaginatedResult<Notification>> {
    const where = this.buildWhereClause(userId, filter);
    const paginationParams = buildCursorPagination(pagination ?? { limit: 20 });

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paginationParams,
    });

    const entities = NotificationMapper.toEntities(notifications);

    return createCursorPaginatedResult(entities, pagination?.limit ?? 20);
  }

  async maskAsRead(id: string): Promise<Notification> {
    const result = await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return NotificationMapper.toEntity(result);
  }

  async maskAllAsRead(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    await this.prisma.notification.updateMany({
      where: { id: { in: ids } },
      data: { readAt: new Date() },
    });
  }

  async countUnread(userId: string): Promise<number> {
    const count: number = await this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    return count;
  }

  private buildWhereClause(
    userId: string,
    filter: FilterType,
  ): Record<string, unknown> {
    const where: Record<string, unknown> = { userId };

    switch (filter) {
      case FilterType.read:
        where.readAt = { not: null };
        break;
      case FilterType.unread:
        where.readAt = null;
        break;
      case FilterType.all:
      default:
        break;
    }

    return where;
  }
}
