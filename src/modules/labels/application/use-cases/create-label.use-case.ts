import { Injectable, ConflictException } from '@nestjs/common';
import { Label } from '../../domain/entities/label.entity';
import { ILabelRepository } from '../../domain/repositories/label.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class CreateLabelUseCase {
  constructor(
    private readonly labelRepository: ILabelRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(
    name: string,
    workspaceId: string,
    userId: string,
    color?: string,
  ): Promise<Label> {
    if (name.length < 1) {
      throw new Error('Label name cannot be empty');
    }

    const existing = await this.labelRepository.findByNameInWorkspace(
      workspaceId,
      name,
    );
    if (existing) {
      throw new ConflictException(
        'A label with this name already exists in this workspace',
      );
    }

    const label = await this.labelRepository.create({
      name,
      workspaceId,
      color,
    });

    await this.activityLogService.logCreate(
      EntityType.LABEL,
      label.id,
      userId,
      {
        name: label.name,
        color: label.color,
        workspaceId,
      },
    );

    return label;
  }
}
