import { Workspace } from '../../domain/entities/workspace.entity';
import { Workspace as PrismaWorkspace } from 'generated/prisma/browser';

export class WorkspaceMapper {
  static toEntity(workspace: PrismaWorkspace): Workspace {
    return Workspace.reconstitute({
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      deletedAt: workspace.deletedAt,
    });
  }
}
