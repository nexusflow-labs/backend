import { Injectable, Inject } from '@nestjs/common';
import { Project } from '../../domain/entities/project.entity';
import {
  IProjectRepository,
  ProjectQueryFilters,
  ProjectPaginationParams,
} from '../../domain/repositories/project.repository';
import { PaginatedResult } from 'src/infrastructure/common/pagination';

@Injectable()
export class ListProjectsUseCase {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(workspaceId: string): Promise<Project[]> {
    return this.projectRepository.findByWorkspace(workspaceId);
  }

  async executePaginated(
    workspaceId: string,
    filters: ProjectQueryFilters,
    pagination: ProjectPaginationParams,
  ): Promise<PaginatedResult<Project>> {
    return this.projectRepository.findByWorkspacePaginated(
      workspaceId,
      filters,
      pagination,
    );
  }
}
