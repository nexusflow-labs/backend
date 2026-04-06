import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import {
  IActivityLogRepository,
  CreateActivityLogData,
  ActivityLogFilters,
  ActivityLogPaginationParams,
} from '../../domain/repositories/activity-log.repository';
import { ActivityLog } from '../../domain/entities/activity-log.entity';
import { EntityType } from '../../domain/enums/entity-type.enum';
import { ActivityLogMapper } from '../mappers/activity-log.mapper';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  PaginatedResult,
  buildOffsetPagination,
  createOffsetPaginatedResult,
} from 'src/infrastructure/common/pagination';

@Injectable()
export class PrismaActivityLogRepository implements IActivityLogRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateActivityLogData): Promise<ActivityLog> {
    const result = await this.prisma.activityLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId,
        workspaceId: data.workspaceId,
        metadata: data.metadata ?? undefined,
      },
    });

    return ActivityLogMapper.toEntity(result);
  }

  async findByFilters(filters: ActivityLogFilters): Promise<ActivityLog[]> {
    const where = this.buildWhereClause(filters);

    const logs = await this.prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return logs.map((l) => ActivityLogMapper.toEntity(l));
  }

  async findByFiltersPaginated(
    filters: ActivityLogFilters,
    pagination: ActivityLogPaginationParams,
  ): Promise<PaginatedResult<ActivityLog>> {
    const where = this.buildWhereClause(filters);
    const { skip, take } = buildOffsetPagination({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    const [logs, totalItems] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: {
            select: {
              fullName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    const entities = logs.map((l) => ActivityLogMapper.toEntity(l));

    return createOffsetPaginatedResult(
      entities,
      totalItems,
      pagination.page,
      pagination.pageSize,
    );
  }

  async findByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<ActivityLog[]> {
    const logs = await this.prisma.activityLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return logs.map((l) => ActivityLogMapper.toEntity(l));
  }

  async findByEntityPaginated(
    entityType: EntityType,
    entityId: string,
    pagination: ActivityLogPaginationParams,
  ): Promise<PaginatedResult<ActivityLog>> {
    const where: Prisma.ActivityLogWhereInput = { entityType, entityId };
    const { skip, take } = buildOffsetPagination({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    const [logs, totalItems] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    const entities = logs.map((l) => ActivityLogMapper.toEntity(l));

    return createOffsetPaginatedResult(
      entities,
      totalItems,
      pagination.page,
      pagination.pageSize,
    );
  }

  private buildWhereClause(
    filters: ActivityLogFilters,
  ): Prisma.ActivityLogWhereInput {
    const where: Prisma.ActivityLogWhereInput = {};

    if (filters.workspaceId) {
      where.workspaceId = filters.workspaceId;
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }
    if (filters.entityId) {
      where.entityId = filters.entityId;
    }
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.fromDate || filters.toDate) {
      const createdAtFilter: Prisma.DateTimeFilter = {};
      if (filters.fromDate) {
        createdAtFilter.gte = filters.fromDate;
      }
      if (filters.toDate) {
        createdAtFilter.lte = filters.toDate;
      }
      where.createdAt = createdAtFilter;
    }

    return where;
  }
}
