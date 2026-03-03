import { Injectable } from '@nestjs/common';
import { Project } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../../domain/repositories/project.repository';

@Injectable()
export class ListProjectsUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(workspaceId: string): Promise<Project[]> {
    return this.projectRepository.findByWorkspace(workspaceId);
  }
}
