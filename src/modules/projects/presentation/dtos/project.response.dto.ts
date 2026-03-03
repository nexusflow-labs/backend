import { Project, ProjectStatus } from '../../domain/entities/project.entity';

export class ProjectResponseDto {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  workspaceId: string;
  ownerId: string;
  createdAt: Date;
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
