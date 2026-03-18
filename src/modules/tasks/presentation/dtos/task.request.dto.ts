import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as taskEntity from '../../domain/entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Implement user authentication',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Implement JWT-based authentication with refresh tokens',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Task priority',
    enum: taskEntity.TaskPriority,
    example: taskEntity.TaskPriority.MEDIUM,
  })
  @IsEnum(taskEntity.TaskPriority)
  @IsOptional()
  priority?: taskEntity.TaskPriority;

  @ApiPropertyOptional({
    description: 'Due date (ISO 8601 format)',
    example: '2024-02-15T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Parent task ID for subtasks',
    example: '98afcc31-ce1e-4573-a477-2ea2ce659515',
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Task title',
    example: 'Updated task title',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Updated description',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Task status',
    enum: taskEntity.TaskStatus,
    example: taskEntity.TaskStatus.IN_PROGRESS,
  })
  @IsEnum(taskEntity.TaskStatus)
  @IsOptional()
  status?: taskEntity.TaskStatus;

  @ApiPropertyOptional({
    description: 'Task priority',
    enum: taskEntity.TaskPriority,
    example: taskEntity.TaskPriority.HIGH,
  })
  @IsEnum(taskEntity.TaskPriority)
  @IsOptional()
  priority?: taskEntity.TaskPriority;

  @ApiPropertyOptional({
    description: 'Due date (ISO 8601 format, null to clear)',
    example: '2024-02-15T23:59:59.000Z',
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string | null;
}

export class AssignTaskDto {
  @ApiPropertyOptional({
    description: 'User ID to assign (null to unassign)',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  assigneeId?: string | null;
}

export class TaskFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: taskEntity.TaskStatus,
  })
  @IsEnum(taskEntity.TaskStatus)
  @IsOptional()
  status?: taskEntity.TaskStatus;

  @ApiPropertyOptional({
    description: 'Filter by priority',
    enum: taskEntity.TaskPriority,
  })
  @IsEnum(taskEntity.TaskPriority)
  @IsOptional()
  priority?: taskEntity.TaskPriority;

  @ApiPropertyOptional({
    description: 'Filter by assignee ID',
  })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Only show root tasks (no parent)',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  rootOnly?: boolean;
}

export class TaskQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: taskEntity.TaskStatus,
    example: taskEntity.TaskStatus.TODO,
  })
  @IsEnum(taskEntity.TaskStatus)
  @IsOptional()
  status?: taskEntity.TaskStatus;

  @ApiPropertyOptional({
    description: 'Filter by priority',
    enum: taskEntity.TaskPriority,
    example: taskEntity.TaskPriority.HIGH,
  })
  @IsEnum(taskEntity.TaskPriority)
  @IsOptional()
  priority?: taskEntity.TaskPriority;

  @ApiPropertyOptional({
    description: 'Filter by assignee ID',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Only show root tasks (no parent)',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  rootOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by creator ID',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  @IsUUID()
  @IsOptional()
  creatorId?: string;

  @ApiPropertyOptional({
    description: 'Due date from (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  dueDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Due date to (ISO 8601)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  dueDateTo?: string;

  @ApiPropertyOptional({
    description: 'Created from (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  createdFrom?: string;

  @ApiPropertyOptional({
    description: 'Created to (ISO 8601)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  createdTo?: string;

  @ApiPropertyOptional({
    description: 'Search in title and description',
    example: 'authentication',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by label IDs (comma-separated)',
    example: 'label-id-1,label-id-2',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  @Transform(({ value }): string[] =>
    typeof value === 'string' ? value.split(',') : value,
  )
  labelIds?: string[];

  @ApiPropertyOptional({
    description: 'Only show overdue tasks',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  overdue?: boolean;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: taskEntity.TaskSortField = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  @Transform(({ value }): string | undefined => value?.toLowerCase())
  sortDirection?: 'asc' | 'desc' = 'desc';
}
