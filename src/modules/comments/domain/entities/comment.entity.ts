export interface CommentProps {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment {
  private constructor(private readonly props: CommentProps) {}

  public static reconstitute(props: CommentProps): Comment {
    return new Comment(props);
  }

  get id(): string {
    return this.props.id;
  }

  get content(): string {
    return this.props.content;
  }

  get taskId(): string {
    return this.props.taskId;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateContent(newContent: string): void {
    if (newContent.length < 1) {
      throw new Error('Comment content cannot be empty');
    }
    (this.props as any).content = newContent;
  }
}
