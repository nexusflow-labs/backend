import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IInvitationRepository } from '../../domain/repositories/invitation.repository';
import { InvitationStatus } from '../../domain/enum/invitation.enum';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';

@Injectable()
export class CancelInvitationUseCase {
  constructor(
    private readonly invitationRepository: IInvitationRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async execute(invitationId: string, operatorId: string): Promise<void> {
    const invitation = await this.invitationRepository.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel invitation that has been ${invitation.status.toLowerCase()}`,
      );
    }

    await this.invitationRepository.updateStatus(
      invitation.id,
      InvitationStatus.CANCELLED,
    );

    await this.activityLogService.logUpdate(
      EntityType.INVITATION,
      invitation.id,
      operatorId,
      {
        previousStatus: InvitationStatus.PENDING,
        newStatus: InvitationStatus.CANCELLED,
        workspaceId: invitation.workspaceId,
      },
    );
  }
}
