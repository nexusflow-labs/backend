import { Comment } from '../entities/comment.entity';
import { CommentWithUser } from '../entities/comment-with-user.entity';

export interface CreateCommentData {
  content: string;
  taskId: string;
  authorId: string;
}

export abstract class ICommentRepository {
  abstract create(data: CreateCommentData): Promise<Comment>;
  abstract save(comment: Comment): Promise<void>;
  abstract findById(id: string): Promise<Comment | null>;
  abstract findByTask(taskId: string): Promise<Comment[]>;
  abstract findByTaskWithUser(taskId: string): Promise<CommentWithUser[]>;
  abstract delete(id: string): Promise<void>;
}
