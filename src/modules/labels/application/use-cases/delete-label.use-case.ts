import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ILabelRepository } from '../../domain/repositories/label.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class DeleteLabelUseCase {
  constructor(
    @Inject(ILabelRepository)
    private readonly labelRepository: ILabelRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const label = await this.labelRepository.findById(id);
    if (!label) {
      throw new NotFoundException('Label not found');
    }

    const name = label.name;
    const workspaceId = label.workspaceId;

    await this.labelRepository.delete(id);

    await this.activityLogService.logDelete(
      EntityType.LABEL,
      id,
      userId,
      workspaceId,
      {
        name,
      },
    );
  }
}
