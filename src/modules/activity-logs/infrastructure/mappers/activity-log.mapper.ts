import { ActivityLog } from '../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../domain/enums/activity-action.enum';
import { EntityType } from '../../domain/enums/entity-type.enum';
import {
  Prisma,
  ActivityLog as PrismaActivityLog,
} from 'generated/prisma/browser';

type PrismaActivityLogWithUser = Prisma.ActivityLogGetPayload<{
  include: {
    user: {
      select: {
        fullName: true;
        avatar: true;
      };
    };
  };
}>;
export class ActivityLogMapper {
  static toEntity(
    raw: PrismaActivityLogWithUser | PrismaActivityLog,
  ): ActivityLog {
    const user =
      'user' in raw && raw.user
        ? {
            name: raw.user.fullName ?? 'Unknown User',
            avatar: raw.user.avatar ?? '',
          }
        : {
            name: 'Unknown User',
            avatar: '',
          };

    return ActivityLog.reconstitute({
      id: raw.id,
      action: raw.action as ActivityAction,
      entityType: raw.entityType as EntityType,
      entityId: raw.entityId,
      userId: raw.userId,
      user,
      workspaceId: raw.workspaceId,
      metadata: raw.metadata as Record<string, any> | null,
      createdAt: raw.createdAt,
    });
  }
}
