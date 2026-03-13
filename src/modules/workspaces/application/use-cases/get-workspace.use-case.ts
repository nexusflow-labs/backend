import { Injectable, Inject } from '@nestjs/common';
import { Workspace } from '../../domain/entities/workspace.entity';
import { IWorkspaceRepository } from '../../domain/repositories/workspaces.repository';

@Injectable()
export class GetWorkspaceUseCase {
  constructor(
    @Inject(IWorkspaceRepository)
    private readonly workspaceRepository: IWorkspaceRepository,
  ) {}

  async execute(id: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(id);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    return workspace;
  }
}
