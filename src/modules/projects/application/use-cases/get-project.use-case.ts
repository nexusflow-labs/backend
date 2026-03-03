import { Injectable, NotFoundException } from '@nestjs/common';
import { Project } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../../domain/repositories/project.repository';

@Injectable()
export class GetProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}
