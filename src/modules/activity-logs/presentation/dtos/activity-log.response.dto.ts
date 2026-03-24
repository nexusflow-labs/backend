import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityLog } from '../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../domain/enums/activity-action.enum';
import { EntityType } from '../../domain/enums/entity-type.enum';

export class ActivityLogResponseDto {
  @ApiProperty({
    description: 'Activity log ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Action type',
    enum: ActivityAction,
    example: ActivityAction.CREATE,
  })
  action: ActivityAction;

  @ApiProperty({
    description: 'Entity type',
    enum: EntityType,
    example: EntityType.TASK,
  })
  entityType: EntityType;

  @ApiProperty({
    description: 'Entity ID',
    example: '98afcc31-ce1e-4573-a477-2ea2ce659515',
  })
  entityId: string;

  @ApiProperty({
    description: 'User ID who performed the action',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  userId: string;

  @ApiPropertyOptional({
    description: 'Additional metadata about the action',
    example: { previousStatus: 'TODO', newStatus: 'IN_PROGRESS' },
    nullable: true,
  })
  metadata: Record<string, any> | null;

  @ApiProperty({
    description: 'When the action occurred',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  static fromEntity(entity: ActivityLog): ActivityLogResponseDto {
    const dto = new ActivityLogResponseDto();
    dto.id = entity.id;
    dto.action = entity.action;
    dto.entityType = entity.entityType;
    dto.entityId = entity.entityId;
    dto.userId = entity.userId;
    dto.metadata = entity.metadata ?? null;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static fromEntities(entities: ActivityLog[]): ActivityLogResponseDto[] {
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

export class PaginatedActivityLogResponseDto {
  @ApiProperty({
    description: 'List of activity logs',
    type: [ActivityLogResponseDto],
  })
  items: ActivityLogResponseDto[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
