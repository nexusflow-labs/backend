import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/entities/notification.enum';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Notification ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.TASK_ASSIGNED,
  })
  type: NotificationType;

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
    description: 'User ID receiving the notification',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  userId: string;

  @ApiPropertyOptional({
    description: 'Workspace ID',
    example: '48a30c8b-53ca-4786-9d60-942bd1c2e241',
  })
  workspaceId?: string;

  @ApiPropertyOptional({
    description: 'User ID who triggered the notification',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  actorId?: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Task Assigned',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Notification message',
    example: 'You have been assigned to task "Implement feature"',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { taskName: 'Implement feature' },
    nullable: true,
  })
  metadata?: Record<string, unknown> | null;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
  })
  isRead: boolean;

  @ApiPropertyOptional({
    description: 'When the notification was read',
    example: '2024-01-15T10:35:00.000Z',
  })
  readAt?: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  static fromEntity(entity: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = entity.id;
    dto.type = entity.type;
    dto.entityType = entity.entityType;
    dto.entityId = entity.entityId;
    dto.userId = entity.userId;
    dto.workspaceId = entity.workspaceId;
    dto.actorId = entity.actorId;
    dto.title = entity.title;
    dto.message = entity.message;
    dto.metadata = entity.metadata;
    dto.isRead = entity.isRead;
    dto.readAt = entity.readAt;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static fromEntities(entities: Notification[]): NotificationResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}

export class UnreadCountResponseDto {
  @ApiProperty({
    description: 'Number of unread notifications',
    example: 5,
  })
  count: number;

  static from(count: number): UnreadCountResponseDto {
    const dto = new UnreadCountResponseDto();
    dto.count = count;
    return dto;
  }
}

export class PaginationMetaDto {
  @ApiPropertyOptional({
    description: 'Next cursor for pagination',
    nullable: true,
  })
  nextCursor?: string | null;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;
}

export class PaginatedNotificationResponseDto {
  @ApiProperty({
    description: 'List of notifications',
    type: [NotificationResponseDto],
  })
  items: NotificationResponseDto[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
