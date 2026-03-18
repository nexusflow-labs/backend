import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EntityType } from '../../domain/enums/entity-type.enum';
import { ActivityAction } from '../../domain/enums/activity-action.enum';

export class ActivityLogFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by entity type',
    enum: EntityType,
    example: EntityType.TASK,
  })
  @IsEnum(EntityType)
  @IsOptional()
  entityType?: EntityType;

  @ApiPropertyOptional({
    description: 'Filter by entity ID',
    example: '98afcc31-ce1e-4573-a477-2ea2ce659515',
  })
  @IsUUID()
  @IsOptional()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;
}

export class ActivityLogQueryDto {
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
    description: 'Filter by entity type',
    enum: EntityType,
    example: EntityType.TASK,
  })
  @IsEnum(EntityType)
  @IsOptional()
  entityType?: EntityType;

  @ApiPropertyOptional({
    description: 'Filter by entity ID',
    example: '98afcc31-ce1e-4573-a477-2ea2ce659515',
  })
  @IsUUID()
  @IsOptional()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by action type',
    enum: ActivityAction,
    example: ActivityAction.CREATE,
  })
  @IsEnum(ActivityAction)
  @IsOptional()
  action?: ActivityAction;

  @ApiPropertyOptional({
    description: 'From date (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'To date (ISO 8601)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  toDate?: string;
}

export class EntityActivityQueryDto {
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
}
