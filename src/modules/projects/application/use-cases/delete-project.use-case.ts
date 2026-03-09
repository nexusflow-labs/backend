import { Injectable, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/repositories/project.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.projectRepository.delete(id);

    await this.activityLogService.logDelete(EntityType.PROJECT, id, userId, {
      name: project.name,
      workspaceId: project.workspaceId,
    });
  }
}
