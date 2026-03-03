import { Project, ProjectStatus } from '../../domain/entities/project.entity';
import { Project as PrismaProject } from 'generated/prisma/browser';

export class ProjectMapper {
  static toEntity(raw: PrismaProject): Project {
    return Project.reconstitute({
      id: raw.id,
      name: raw.name,
      description: raw.description ?? undefined,
      status: raw.status as ProjectStatus,
      workspaceId: raw.workspaceId,
      ownerId: raw.ownerId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toPersistence(entity: Project) {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      workspaceId: entity.workspaceId,
      ownerId: entity.ownerId,
    };
  }
}
