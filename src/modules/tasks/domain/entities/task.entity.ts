export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface TaskProps {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate?: Date | null;
  projectId: string;
  assigneeId?: string | null;
  creatorId: string;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class Task {
  private constructor(private readonly props: TaskProps) {}

  public static reconstitute(props: TaskProps): Task {
    return new Task(props);
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get priority(): TaskPriority {
    return this.props.priority;
  }

  get position(): number {
    return this.props.position;
  }

  get dueDate(): Date | null | undefined {
    return this.props.dueDate;
  }

  get projectId(): string {
    return this.props.projectId;
  }

  get assigneeId(): string | null | undefined {
    return this.props.assigneeId;
  }

  get creatorId(): string {
    return this.props.creatorId;
  }

  get parentId(): string | null | undefined {
    return this.props.parentId;
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

  public updateTitle(newTitle: string): void {
    if (newTitle.length < 2) {
      throw new Error('Task title must be at least 2 characters');
    }
    (this.props as any).title = newTitle;
  }

  public updateDescription(description: string | null): void {
    (this.props as any).description = description;
  }

  public updateStatus(status: TaskStatus): void {
    (this.props as any).status = status;
  }

  public updatePriority(priority: TaskPriority): void {
    (this.props as any).priority = priority;
  }

  public updateDueDate(dueDate: Date | null): void {
    (this.props as any).dueDate = dueDate;
  }

  public updatePosition(position: number): void {
    (this.props as any).position = position;
  }

  public assign(assigneeId: string | null): void {
    (this.props as any).assigneeId = assigneeId;
  }

  public isDeleted(): boolean {
    return this.props.deletedAt !== null && this.props.deletedAt !== undefined;
  }

  public isDone(): boolean {
    return this.props.status === TaskStatus.DONE;
  }

  public isOverdue(): boolean {
    if (!this.props.dueDate) return false;
    return new Date() > this.props.dueDate && !this.isDone();
  }

  public isSubtask(): boolean {
    return this.props.parentId !== null && this.props.parentId !== undefined;
  }
}
