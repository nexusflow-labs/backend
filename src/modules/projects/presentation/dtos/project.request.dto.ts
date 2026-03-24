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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as projectEntity from '../../domain/entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'My Project',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Project description',
    example: 'A project for managing tasks',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Project name',
    example: 'Updated Project Name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Project description',
    example: 'Updated description',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Project status',
    enum: projectEntity.ProjectStatus,
    example: projectEntity.ProjectStatus.ACTIVE,
  })
  @IsEnum(projectEntity.ProjectStatus)
  @IsOptional()
  status?: projectEntity.ProjectStatus;
}

export class ProjectQueryDto {
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
    description: 'Search by project name',
    example: 'project',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by project status',
    enum: projectEntity.ProjectStatus,
    example: projectEntity.ProjectStatus.ACTIVE,
  })
  @IsEnum(projectEntity.ProjectStatus)
  @IsOptional()
  status?: projectEntity.ProjectStatus;

  @ApiPropertyOptional({
    description: 'Filter by owner ID',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: projectEntity.ProjectSortField = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  @Transform(({ value }): 'asc' | 'desc' | undefined =>
    typeof value === 'string'
      ? (value.toLowerCase() as 'asc' | 'desc')
      : undefined,
  )
  sortDirection?: 'asc' | 'desc' = 'desc';
}
