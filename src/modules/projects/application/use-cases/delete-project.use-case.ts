import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IProjectRepository } from '../../domain/repositories/project.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const workspaceId = project.workspaceId;

    await this.projectRepository.delete(id);

    await this.activityLogService.logDelete(EntityType.PROJECT, id, userId, {
      name: project.name,
      workspaceId,
    });

    this.wsEmitter.emitToWorkspace(
      workspaceId,
      RealtimeEvents.PROJECT_DELETED,
      {
        projectId: id,
        deletedBy: userId,
      },
    );
  }
}
