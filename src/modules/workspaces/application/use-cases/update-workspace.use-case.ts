import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Workspace } from '../../domain/entities/workspace.entity';
import { IWorkspaceRepository } from '../../domain/repositories/workspaces.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class UpdateWorkspaceUseCase {
  constructor(
    @Inject(IWorkspaceRepository)
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(
    workspaceId: string,
    name: string,
    description: string | undefined,
    userId: string,
  ): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const oldName = workspace.name;
    workspace.updateName(name);
    workspace.updateDescription(description ?? null);
    await this.workspaceRepository.save(workspace);

    await this.activityLogService.logUpdate(
      EntityType.WORKSPACE,
      workspaceId,
      userId,
      workspaceId,
      { oldName, newName: name },
    );

    return workspace;
  }
}
