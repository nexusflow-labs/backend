import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Project, ProjectStatus } from '../../domain/entities/project.entity';

export class ProjectResponseDto {
  @ApiProperty({
    description: 'Project ID',
    example: 'c6e39e84-a1b0-4a13-b268-a271295ee378',
  })
  id: string;

  @ApiProperty({
    description: 'Project name',
    example: 'My Project',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Project description',
    example: 'A project for managing tasks',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Project status',
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
  })
  status: ProjectStatus;

  @ApiProperty({
    description: 'Workspace ID',
    example: '48a30c8b-53ca-4786-9d60-942bd1c2e241',
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Owner user ID',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  ownerId: string;

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

  static fromEntity(entity: Project): ProjectResponseDto {
    const dto = new ProjectResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description ?? null;
    dto.status = entity.status;
    dto.workspaceId = entity.workspaceId;
    dto.ownerId = entity.ownerId;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static fromEntities(entities: Project[]): ProjectResponseDto[] {
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

  @ApiPropertyOptional({
    description: 'Next cursor for cursor-based pagination',
    nullable: true,
  })
  nextCursor?: string | null;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;
}

export class PaginatedProjectResponseDto {
  @ApiProperty({ description: 'List of projects', type: [ProjectResponseDto] })
  items: ProjectResponseDto[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
