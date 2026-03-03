import { Project } from '../entities/project.entity';

export interface CreateProjectData {
  name: string;
  description?: string | null;
  workspaceId: string;
  ownerId: string;
}

export abstract class IProjectRepository {
  abstract create(data: CreateProjectData): Promise<Project>;
  abstract save(project: Project): Promise<void>;
  abstract findById(id: string): Promise<Project | null>;
  abstract findByWorkspace(workspaceId: string): Promise<Project[]>;
  abstract delete(id: string): Promise<void>;
}
