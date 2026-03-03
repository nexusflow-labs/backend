import { Injectable, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/repositories/project.repository';

@Injectable()
export class DeleteProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<void> {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.projectRepository.delete(id);
  }
}
