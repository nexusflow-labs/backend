import { Injectable } from '@nestjs/common';
import { Workspace } from '../../domain/entities/workspace.entity';
import { IWorkspaceRepository } from '../../domain/repositories/workspaces.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class CreateWorkspaceUseCase {
  constructor(
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(
    name: string,
    creatorId: string,
    description?: string,
  ): Promise<Workspace> {
    if (name.length < 3) {
      throw new Error('Workspace name must be at least 3 characters');
    }

    const workspace = await this.workspaceRepository.create({
      name,
      description,
      creatorId,
    });

    await this.activityLogService.logCreate(
      EntityType.WORKSPACE,
      workspace.id,
      creatorId,
      { name: workspace.name },
    );

    return workspace;
  }
}
