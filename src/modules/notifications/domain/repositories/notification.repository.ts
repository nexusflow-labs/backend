import {
  CursorPaginationParams,
  PaginatedResult,
} from 'src/infrastructure/common/pagination';
import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../entities/notification.enum';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

export interface CreateNotificationData {
  type: NotificationType;
  entityType: EntityType;
  entityId: string;
  userId: string;
  workspaceId?: string;
  actorId?: string;
  title: string;
  message?: string;
  metadata?: Record<string, unknown> | null;
}

export enum FilterType {
  read = 'read',
  unread = 'unread',
  all = 'all',
}

export abstract class INotificationRepository {
  abstract create(data: CreateNotificationData): Promise<Notification>;
  abstract findById(id: string): Promise<Notification | null>;
  abstract listByUser(
    userId: string,
    filter: FilterType,
    pagination?: CursorPaginationParams,
  ): Promise<PaginatedResult<Notification>>;
  abstract maskAsRead(id: string): Promise<Notification>;
  abstract maskAllAsRead(ids: string[]): Promise<void>;
  abstract countUnread(userId: string): Promise<number>;
}
