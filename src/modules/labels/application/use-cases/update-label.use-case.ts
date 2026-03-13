import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { Label } from '../../domain/entities/label.entity';
import { ILabelRepository } from '../../domain/repositories/label.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

export interface UpdateLabelInput {
  name?: string;
  color?: string;
}

@Injectable()
export class UpdateLabelUseCase {
  constructor(
    @Inject(ILabelRepository)
    private readonly labelRepository: ILabelRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(
    id: string,
    input: UpdateLabelInput,
    userId: string,
  ): Promise<Label> {
    const label = await this.labelRepository.findById(id);
    if (!label) {
      throw new NotFoundException('Label not found');
    }

    const changes: Record<string, { old: unknown; new: unknown }> = {};

    if (input.name && input.name !== label.name) {
      const existing = await this.labelRepository.findByNameInWorkspace(
        label.workspaceId,
        input.name,
      );
      if (existing) {
        throw new ConflictException(
          'A label with this name already exists in this workspace',
        );
      }
      changes.name = { old: label.name, new: input.name };
      label.updateName(input.name);
    }

    if (input.color && input.color !== label.color) {
      changes.color = { old: label.color, new: input.color };
      label.updateColor(input.color);
    }

    await this.labelRepository.save(label);

    if (Object.keys(changes).length > 0) {
      await this.activityLogService.logUpdate(EntityType.LABEL, id, userId, {
        changes,
      });
    }

    return label;
  }
}
