import { Project } from '../entities/project.entity';
import { PaginatedResult } from 'src/infrastructure/common/pagination';

export interface CreateProjectData {
  name: string;
  description?: string | null;
  workspaceId: string;
  ownerId: string;
}

export interface ProjectQueryFilters {
  search?: string;
  status?: string;
  ownerId?: string;
}

export interface ProjectPaginationParams {
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export abstract class IProjectRepository {
  abstract create(data: CreateProjectData): Promise<Project>;
  abstract save(project: Project): Promise<void>;
  abstract findById(id: string): Promise<Project | null>;
  abstract findByWorkspace(workspaceId: string): Promise<Project[]>;
  abstract findByWorkspacePaginated(
    workspaceId: string,
    filters: ProjectQueryFilters,
    pagination: ProjectPaginationParams,
  ): Promise<PaginatedResult<Project>>;
  abstract delete(id: string): Promise<void>;
}
