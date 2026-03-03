import { Comment } from '../entities/comment.entity';
import { CommentWithUser } from '../entities/comment-with-user.entity';
import { PaginatedResult } from 'src/infrastructure/common/pagination';

export interface CreateCommentData {
  content: string;
  taskId: string;
  authorId: string;
}

export interface CommentPaginationParams {
  page: number;
  pageSize: number;
}

export abstract class ICommentRepository {
  abstract create(data: CreateCommentData): Promise<Comment>;
  abstract save(comment: Comment): Promise<void>;
  abstract findById(id: string): Promise<Comment | null>;
  abstract findByTask(taskId: string): Promise<Comment[]>;
  abstract findByTaskWithUser(taskId: string): Promise<CommentWithUser[]>;
  abstract findByTaskWithUserPaginated(
    taskId: string,
    pagination: CommentPaginationParams,
  ): Promise<PaginatedResult<CommentWithUser>>;
  abstract delete(id: string): Promise<void>;
}
