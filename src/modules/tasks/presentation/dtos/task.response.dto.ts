import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../domain/entities/task.entity';

export class TaskResponseDto {
  @ApiProperty({
    description: 'Task ID',
    example: '98afcc31-ce1e-4573-a477-2ea2ce659515',
  })
  id: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Implement user authentication',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Implement JWT-based authentication',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Task status',
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'Task priority',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ApiPropertyOptional({
    description: 'Due date',
    example: '2024-02-15T23:59:59.000Z',
    nullable: true,
  })
  dueDate: Date | null;

  @ApiProperty({
    description: 'Project ID',
    example: 'c6e39e84-a1b0-4a13-b268-a271295ee378',
  })
  projectId: string;

  @ApiPropertyOptional({
    description: 'Assignee user ID',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
    nullable: true,
  })
  assigneeId: string | null;

  @ApiProperty({
    description: 'Creator user ID',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  creatorId: string;

  @ApiPropertyOptional({
    description: 'Parent task ID for subtasks',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  parentId: string | null;

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

  static fromEntity(entity: Task): TaskResponseDto {
    const dto = new TaskResponseDto();
    dto.id = entity.id;
    dto.title = entity.title;
    dto.description = entity.description ?? null;
    dto.status = entity.status;
    dto.priority = entity.priority;
    dto.dueDate = entity.dueDate ?? null;
    dto.projectId = entity.projectId;
    dto.assigneeId = entity.assigneeId ?? null;
    dto.creatorId = entity.creatorId;
    dto.parentId = entity.parentId ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static fromEntities(entities: Task[]): TaskResponseDto[] {
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

  @ApiPropertyOptional({ description: 'Next cursor for cursor-based pagination', nullable: true })
  nextCursor?: string | null;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;
}

export class PaginatedTaskResponseDto {
  @ApiProperty({ description: 'List of tasks', type: [TaskResponseDto] })
  items: TaskResponseDto[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
