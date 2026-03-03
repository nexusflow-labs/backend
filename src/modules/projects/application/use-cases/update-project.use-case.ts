import { Injectable, NotFoundException } from '@nestjs/common';
import { Project, ProjectStatus } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../../domain/repositories/project.repository';

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

@Injectable()
export class UpdateProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(id: string, input: UpdateProjectInput): Promise<Project> {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (input.name !== undefined) {
      project.updateName(input.name);
    }

    if (input.description !== undefined) {
      project.updateDescription(input.description);
    }

    if (input.status !== undefined) {
      project.updateStatus(input.status);
    }

    await this.projectRepository.save(project);
    return project;
  }
}
