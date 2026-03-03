import { Comment } from '../../domain/entities/comment.entity';
import { CommentWithUser } from '../../domain/entities/comment-with-user.entity';
import { UserInfo } from 'src/shared/interfaces';

export class CommentResponseDto {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: Comment): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = entity.id;
    dto.content = entity.content;
    dto.taskId = entity.taskId;
    dto.authorId = entity.authorId;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

export class CommentWithUserResponseDto {
  id: string;
  content: string;
  taskId: string;
  author: UserInfo;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: CommentWithUser): CommentWithUserResponseDto {
    const dto = new CommentWithUserResponseDto();
    dto.id = entity.id;
    dto.content = entity.content;
    dto.taskId = entity.taskId;
    dto.author = entity.author;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static fromEntities(
    entities: CommentWithUser[],
  ): CommentWithUserResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
