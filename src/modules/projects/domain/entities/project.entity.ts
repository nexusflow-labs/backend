export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  COMPLETED = 'COMPLETED',
}

export interface ProjectProps {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  workspaceId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class Project {
  private constructor(private readonly props: ProjectProps) {}

  public static reconstitute(props: ProjectProps): Project {
    return new Project(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get status(): ProjectStatus {
    return this.props.status;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | null | undefined {
    return this.props.deletedAt;
  }

  public updateName(newName: string): void {
    if (newName.length < 2) {
      throw new Error('Project name must be at least 2 characters');
    }
    (this.props as any).name = newName;
  }

  public updateDescription(description: string | null): void {
    (this.props as any).description = description;
  }

  public updateStatus(status: ProjectStatus): void {
    (this.props as any).status = status;
  }

  public isDeleted(): boolean {
    return this.props.deletedAt !== null && this.props.deletedAt !== undefined;
  }

  public isActive(): boolean {
    return this.props.status === ProjectStatus.ACTIVE;
  }
}
