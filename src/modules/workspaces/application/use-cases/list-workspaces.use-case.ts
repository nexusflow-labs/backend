import { Injectable, Inject } from '@nestjs/common';
import { Workspace } from '../../domain/entities/workspace.entity';
import { IWorkspaceRepository } from '../../domain/repositories/workspaces.repository';

@Injectable()
export class ListWorkspacesUseCase {
  constructor(
    @Inject(IWorkspaceRepository)
    private readonly workspaceRepository: IWorkspaceRepository,
  ) {}

  async execute(): Promise<Workspace[]> {
    return await this.workspaceRepository.findAll();
  }
}
