import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import { NotificationType } from './notification.enum';

export interface NotificationProps {
  id: string;
  type: NotificationType;
  entityType: EntityType;
  entityId: string;
  userId: string;
  workspaceId?: string;
  actorId?: string;
  title: string;
  message?: string;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  readAt?: Date;
}

export class Notification {
  private constructor(private readonly props: NotificationProps) {}

  public static reconstitute(props: NotificationProps): Notification {
    return new Notification(props);
  }

  get id(): string {
    return this.props.id;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get entityType(): EntityType {
    return this.props.entityType;
  }

  get entityId(): string {
    return this.props.entityId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get actorId(): string | undefined {
    return this.props.actorId;
  }

  get workspaceId(): string | undefined {
    return this.props.workspaceId;
  }

  get title(): string {
    return this.props.title;
  }

  get message(): string | undefined {
    return this.props.message;
  }

  get metadata(): Record<string, any> | null | undefined {
    return this.props.metadata;
  }

  get isRead(): boolean {
    return this.props.readAt !== undefined;
  }

  get readAt(): Date | undefined {
    return this.props.readAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
