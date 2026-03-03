export interface WorkspaceProps {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class Workspace {
  private constructor(private readonly props: WorkspaceProps) {}

  // For creating new workspace (before DB insert)
  public static create(
    props: Pick<WorkspaceProps, 'name' | 'description'>,
  ): Workspace {
    if (props.name.length < 3) {
      throw new Error('Workspace name must be at least 3 characters');
    }
    if (props.name.length > 50) {
      throw new Error('Workspace name must be at most 50 characters');
    }
    return new Workspace({
      id: '', // Will be set by DB
      name: props.name,
      description: props.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  }

  // For reconstituting from DB
  public static reconstitute(props: WorkspaceProps): Workspace {
    return new Workspace(props);
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
    if (newName.length < 3) {
      throw new Error('Workspace name must be at least 3 characters');
    }
    if (newName.length > 50) {
      throw new Error('Workspace name must be at most 50 characters');
    }
    (this.props as any).name = newName;
  }

  public updateDescription(description: string | null): void {
    (this.props as any).description = description;
  }

  public isDeleted(): boolean {
    return this.props.deletedAt !== null && this.props.deletedAt !== undefined;
  }
}
