import { ActivityAction } from '../enums/activity-action.enum';
import { EntityType } from '../enums/entity-type.enum';

export interface ActivityLogProps {
  id: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  userId: string;
  user: {
    name: string;
    avatar: string;
  };
  workspaceId: string;
  metadata?: Record<string, any> | null;
  createdAt: Date;
}

export class ActivityLog {
  private constructor(private readonly props: ActivityLogProps) {}

  public static reconstitute(props: ActivityLogProps): ActivityLog {
    return new ActivityLog(props);
  }

  get id(): string {
    return this.props.id;
  }

  get action(): ActivityAction {
    return this.props.action;
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

  get user(): { name: string; avatar: string } {
    return this.props.user;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get metadata(): Record<string, any> | null | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
