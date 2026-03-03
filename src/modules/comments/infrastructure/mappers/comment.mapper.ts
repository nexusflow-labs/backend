import { Comment } from '../../domain/entities/comment.entity';
import { CommentWithUser } from '../../domain/entities/comment-with-user.entity';
import {
  Comment as PrismaComment,
  User as PrismaUser,
} from 'generated/prisma/browser';

export class CommentMapper {
  static toEntity(raw: PrismaComment): Comment {
    return Comment.reconstitute({
      id: raw.id,
      content: raw.content,
      taskId: raw.taskId,
      authorId: raw.authorId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toEntityWithUser(
    raw: PrismaComment & { author: PrismaUser },
  ): CommentWithUser {
    return CommentWithUser.create({
      id: raw.id,
      content: raw.content,
      taskId: raw.taskId,
      author: {
        id: raw.author.id,
        fullName: raw.author.fullName,
        email: raw.author.email,
        avatar: raw.author.avatar ?? undefined,
      },
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
