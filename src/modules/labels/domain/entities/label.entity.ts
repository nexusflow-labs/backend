export interface LabelProps {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
  createdAt: Date;
}

export class Label {
  private constructor(private readonly props: LabelProps) {}

  public static reconstitute(props: LabelProps): Label {
    return new Label(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get color(): string {
    return this.props.color;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  public updateName(newName: string): void {
    if (newName.length < 1) {
      throw new Error('Label name cannot be empty');
    }
    if (newName.length > 50) {
      throw new Error('Label name cannot exceed 50 characters');
    }
    (this.props as any).name = newName;
  }

  public updateColor(newColor: string): void {
    if (!/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      throw new Error('Invalid color format. Use hex format (e.g., #6B7280)');
    }
    (this.props as any).color = newColor;
  }
}
