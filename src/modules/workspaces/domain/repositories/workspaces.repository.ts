import { Workspace } from '../entities/workspace.entity';

export interface CreateWorkspaceData {
  name: string;
  description?: string | null;
  creatorId: string;
}

export abstract class IWorkspaceRepository {
  abstract create(data: CreateWorkspaceData): Promise<Workspace>;
  abstract save(workspace: Workspace): Promise<void>;
  abstract findAll(): Promise<Workspace[]>;
  abstract findById(id: string): Promise<Workspace | null>;
  abstract delete(id: string): Promise<void>;
}
