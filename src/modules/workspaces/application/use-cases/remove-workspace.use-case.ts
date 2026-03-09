import { Injectable, NotFoundException } from '@nestjs/common';
import { IWorkspaceRepository } from '../../domain/repositories/workspaces.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class RemoveWorkspaceUseCase {
  constructor(
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(workspaceId: string, userId: string): Promise<void> {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    await this.workspaceRepository.delete(workspaceId);

    await this.activityLogService.logDelete(
      EntityType.WORKSPACE,
      workspaceId,
      userId,
      { name: workspace.name },
    );
  }
}
