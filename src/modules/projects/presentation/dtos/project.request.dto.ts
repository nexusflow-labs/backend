import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import * as projectEntity from '../../domain/entities/project.entity';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(projectEntity.ProjectStatus)
  @IsOptional()
  status?: projectEntity.ProjectStatus;
}

export class ProjectQueryDto {
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

  // Filters
  @IsString()
  @IsOptional()
  @MaxLength(100)
  search?: string;

  @IsEnum(projectEntity.ProjectStatus)
  @IsOptional()
  status?: projectEntity.ProjectStatus;

  @IsUUID()
  @IsOptional()
  ownerId?: string;

  // Sorting
  @IsOptional()
  @IsString()
  sortBy?: projectEntity.ProjectSortField = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  @Transform(({ value }) => value?.toLowerCase())
  sortDirection?: 'asc' | 'desc' = 'desc';
}
