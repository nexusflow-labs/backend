import { Injectable } from '@nestjs/common';
import { Workspace } from '../../domain/entities/workspace.entity';
import { IWorkspaceRepository } from '../../domain/repositories/workspaces.repository';

@Injectable()
export class CreateWorkspaceUseCase {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  async execute(
    name: string,
    creatorId: string,
    description?: string,
  ): Promise<Workspace> {
    if (name.length < 3) {
      throw new Error('Workspace name must be at least 3 characters');
    }

    return this.workspaceRepository.create({
      name,
      description,
      creatorId,
    });
  }
}
