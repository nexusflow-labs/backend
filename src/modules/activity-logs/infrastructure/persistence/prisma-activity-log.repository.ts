import { Injectable } from '@nestjs/common';
import {
  IActivityLogRepository,
  CreateActivityLogData,
  ActivityLogFilters,
} from '../../domain/repositories/activity-log.repository';
import { ActivityLog } from '../../domain/entities/activity-log.entity';
import { EntityType } from '../../domain/enums/entity-type.enum';
import { ActivityLogMapper } from '../mappers/activity-log.mapper';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

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
        metadata: data.metadata ?? undefined,
      },
    });

    return ActivityLogMapper.toEntity(result);
  }

  async findByFilters(filters: ActivityLogFilters): Promise<ActivityLog[]> {
    const where: any = {};

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }
    if (filters.entityId) {
      where.entityId = filters.entityId;
    }
    if (filters.userId) {
      where.userId = filters.userId;
    }

    const logs = await this.prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return logs.map((l) => ActivityLogMapper.toEntity(l));
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
    });

    return logs.map((l) => ActivityLogMapper.toEntity(l));
  }
}
