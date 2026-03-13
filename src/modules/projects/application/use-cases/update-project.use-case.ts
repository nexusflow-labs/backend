import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Project, ProjectStatus } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../../domain/repositories/project.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
  ) {}

  async execute(
    id: string,
    input: UpdateProjectInput,
    userId: string,
  ): Promise<Project> {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const changes: Record<string, { old: unknown; new: unknown }> = {};

    if (input.name !== undefined && input.name !== project.name) {
      changes.name = { old: project.name, new: input.name };
      project.updateName(input.name);
    }

    if (
      input.description !== undefined &&
      input.description !== project.description
    ) {
      changes.description = {
        old: project.description,
        new: input.description,
      };
      project.updateDescription(input.description);
    }

    if (input.status !== undefined && input.status !== project.status) {
      changes.status = { old: project.status, new: input.status };
      project.updateStatus(input.status);
    }

    await this.projectRepository.save(project);

    if (Object.keys(changes).length > 0) {
      await this.activityLogService.logUpdate(EntityType.PROJECT, id, userId, {
        changes,
      });

      this.wsEmitter.emitToWorkspace(
        project.workspaceId,
        RealtimeEvents.PROJECT_UPDATED,
        {
          project: {
            id: project.id,
            name: project.name,
            status: project.status,
          },
          changes,
          updatedBy: userId,
        },
      );
    }

    return project;
  }
}
