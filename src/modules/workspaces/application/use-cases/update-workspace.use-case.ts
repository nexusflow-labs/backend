import { NotFoundException } from '@nestjs/common';
import { Workspace } from '../../domain/entities/workspace.entity';
import { IWorkspaceRepository } from '../../domain/repositories/workspaces.repository';

export class UpdateWorkspaceUseCase {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  async execute(workspaceId: string, name: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    workspace.updateName(name);
    await this.workspaceRepository.save(workspace);
    return workspace;
  }
}
