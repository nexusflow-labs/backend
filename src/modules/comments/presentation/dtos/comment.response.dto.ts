import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Comment } from '../../domain/entities/comment.entity';
import { CommentWithUser } from '../../domain/entities/comment-with-user.entity';
import type { UserInfo } from 'src/shared/interfaces';

export class CommentResponseDto {
  @ApiProperty({
    description: 'Comment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Comment content',
    example: 'This looks good!',
  })
  content: string;

  @ApiProperty({
    description: 'Task ID',
    example: '98afcc31-ce1e-4573-a477-2ea2ce659515',
  })
  taskId: string;

  @ApiProperty({
    description: 'Author user ID',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  authorId: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
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

export class UserInfoDto {
  @ApiProperty({ description: 'User ID', example: 'c7b7649c-7390-4494-8fe7-c21df469fc09' })
  id: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  fullName: string;

  @ApiProperty({ description: 'User email', example: 'john.doe@example.com' })
  email: string;

  @ApiPropertyOptional({ description: 'User avatar URL' })
  avatar?: string;
}

export class CommentWithUserResponseDto {
  @ApiProperty({
    description: 'Comment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Comment content',
    example: 'This looks good!',
  })
  content: string;

  @ApiProperty({
    description: 'Task ID',
    example: '98afcc31-ce1e-4573-a477-2ea2ce659515',
  })
  taskId: string;

  @ApiProperty({
    description: 'Author information',
    type: UserInfoDto,
  })
  author: UserInfo;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
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

export class PaginationMetaDto {
  @ApiPropertyOptional({ description: 'Total number of items' })
  totalItems?: number;

  @ApiPropertyOptional({ description: 'Total number of pages' })
  totalPages?: number;

  @ApiPropertyOptional({ description: 'Current page number' })
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  pageSize?: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;
}

export class PaginatedCommentResponseDto {
  @ApiProperty({ description: 'List of comments', type: [CommentWithUserResponseDto] })
  items: CommentWithUserResponseDto[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
