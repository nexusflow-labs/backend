export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface MemberProps {
  id: string;
  userId: string;
  workspaceId: string;
  role: MemberRole;
  createdAt: Date;
}

export class Member {
  private constructor(private readonly props: MemberProps) {}

  public static reconstitute(props: MemberProps): Member {
    return new Member(props);
  }

  public updateRole(newRole: MemberRole): void {
    (this.props as any).role = newRole;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get role(): MemberRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  public isOwner(): boolean {
    return this.props.role === MemberRole.OWNER;
  }

  public isAdmin(): boolean {
    return this.props.role === MemberRole.ADMIN;
  }

  public canManageMembers(): boolean {
    return this.isOwner() || this.isAdmin();
  }
}
