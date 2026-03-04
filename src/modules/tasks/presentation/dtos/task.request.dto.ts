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
import * as taskEntity from '../../domain/entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsEnum(taskEntity.TaskPriority)
  @IsOptional()
  priority?: taskEntity.TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsEnum(taskEntity.TaskStatus)
  @IsOptional()
  status?: taskEntity.TaskStatus;

  @IsEnum(taskEntity.TaskPriority)
  @IsOptional()
  priority?: taskEntity.TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string | null;
}

export class AssignTaskDto {
  @IsUUID()
  @IsOptional()
  assigneeId?: string | null;
}

export class TaskFilterDto {
  @IsEnum(taskEntity.TaskStatus)
  @IsOptional()
  status?: taskEntity.TaskStatus;

  @IsEnum(taskEntity.TaskPriority)
  @IsOptional()
  priority?: taskEntity.TaskPriority;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  rootOnly?: boolean;
}

export class TaskQueryDto {
  // Pagination
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  // Basic filters (from TaskFilterDto)
  @IsEnum(taskEntity.TaskStatus)
  @IsOptional()
  status?: taskEntity.TaskStatus;

  @IsEnum(taskEntity.TaskPriority)
  @IsOptional()
  priority?: taskEntity.TaskPriority;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  rootOnly?: boolean;

  // Extended filters
  @IsUUID()
  @IsOptional()
  creatorId?: string;

  @IsDateString()
  @IsOptional()
  dueDateFrom?: string;

  @IsDateString()
  @IsOptional()
  dueDateTo?: string;

  @IsDateString()
  @IsOptional()
  createdFrom?: string;

  @IsDateString()
  @IsOptional()
  createdTo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  search?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  @Transform(({ value }): string[] =>
    typeof value === 'string' ? value.split(',') : value,
  )
  labelIds?: string[];

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  overdue?: boolean;

  // Sorting
  @IsOptional()
  @IsString()
  sortBy?: taskEntity.TaskSortField = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  @Transform(({ value }): string | undefined => value?.toLowerCase())
  sortDirection?: 'asc' | 'desc' = 'desc';
}
