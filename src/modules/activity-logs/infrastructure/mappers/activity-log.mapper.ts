import { ActivityLog } from '../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../domain/enums/activity-action.enum';
import { EntityType } from '../../domain/enums/entity-type.enum';
import { ActivityLog as PrismaActivityLog } from 'generated/prisma/browser';

export class ActivityLogMapper {
  static toEntity(raw: PrismaActivityLog): ActivityLog {
    return ActivityLog.reconstitute({
      id: raw.id,
      action: raw.action as ActivityAction,
      entityType: raw.entityType as EntityType,
      entityId: raw.entityId,
      userId: raw.userId,
      metadata: raw.metadata as Record<string, any> | null,
      createdAt: raw.createdAt,
    });
  }
}
