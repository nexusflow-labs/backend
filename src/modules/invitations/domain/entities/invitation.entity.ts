import { MemberRole } from 'src/modules/members/domain/entities/member.entity';
import { InvitationStatus } from '../enum/invitation.enum';

export interface InvitationProps {
  id: string;
  email: string;
  role: MemberRole;
  token: string;
  status: InvitationStatus;
  workspaceId: string;
  invitedById: string;
  expiresAt: Date;
  createdAt: Date;
}

export class Invitation {
  private constructor(private readonly props: InvitationProps) {}

  public static reconstitute(props: InvitationProps): Invitation {
    return new Invitation(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get role(): MemberRole {
    return this.props.role;
  }

  get token(): string {
    return this.props.token;
  }

  get status(): InvitationStatus {
    return this.props.status;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get invitedById(): string {
    return this.props.invitedById;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  public updateStatus(newStatus: InvitationStatus): void {
    (this.props as any).status = newStatus;
  }

  public isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }
}
