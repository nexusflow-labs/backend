import { UserInfo } from 'src/shared/interfaces';

export interface CommentWithUserProps {
  id: string;
  content: string;
  taskId: string;
  author: UserInfo;
  createdAt: Date;
  updatedAt: Date;
}

export class CommentWithUser {
  private constructor(private readonly props: CommentWithUserProps) {}

  public static create(props: CommentWithUserProps): CommentWithUser {
    return new CommentWithUser(props);
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

  get author(): UserInfo {
    return this.props.author;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
