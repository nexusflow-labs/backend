import { Injectable } from '@nestjs/common';
import {
  ICommentRepository,
  CreateCommentData,
  CommentPaginationParams,
} from '../../domain/repositories/comment.repository';
import { Comment } from '../../domain/entities/comment.entity';
import { CommentWithUser } from '../../domain/entities/comment-with-user.entity';
import { CommentMapper } from '../mappers/comment.mapper';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  PaginatedResult,
  buildOffsetPagination,
  createOffsetPaginatedResult,
} from 'src/infrastructure/common/pagination';

@Injectable()
export class PrismaCommentRepository implements ICommentRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCommentData): Promise<Comment> {
    const result = await this.prisma.comment.create({
      data: {
        content: data.content,
        taskId: data.taskId,
        authorId: data.authorId,
      },
    });

    return CommentMapper.toEntity(result);
  }

  async save(comment: Comment): Promise<void> {
    await this.prisma.comment.update({
      where: { id: comment.id },
      data: {
        content: comment.content,
      },
    });
  }

  async findById(id: string): Promise<Comment | null> {
    const result = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!result) {
      return null;
    }

    return CommentMapper.toEntity(result);
  }

  async findByTask(taskId: string): Promise<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c) => CommentMapper.toEntity(c));
  }

  async findByTaskWithUser(taskId: string): Promise<CommentWithUser[]> {
    const comments = await this.prisma.comment.findMany({
      where: { taskId },
      include: {
        author: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c) => CommentMapper.toEntityWithUser(c));
  }

  async findByTaskWithUserPaginated(
    taskId: string,
    pagination: CommentPaginationParams,
  ): Promise<PaginatedResult<CommentWithUser>> {
    const where = { taskId };
    const { skip, take } = buildOffsetPagination({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    const [comments, totalItems] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: {
          author: true,
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      this.prisma.comment.count({ where }),
    ]);

    const entities = comments.map((c) => CommentMapper.toEntityWithUser(c));

    return createOffsetPaginatedResult(
      entities,
      totalItems,
      pagination.page,
      pagination.pageSize,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({
      where: { id },
    });
  }
}
