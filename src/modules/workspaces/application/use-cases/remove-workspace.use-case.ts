import { Injectable, NotFoundException } from '@nestjs/common';
import { IWorkspaceRepository } from '../../domain/repositories/workspaces.repository';

@Injectable()
export class RemoveWorkspaceUseCase {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  async execute(workspaceId: string): Promise<void> {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    await this.workspaceRepository.delete(workspaceId);
  }
}
