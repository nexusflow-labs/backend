import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { IInvitationRepository } from '../../domain/repositories/invitation.repository';
import { IUserRepository } from 'src/modules/auth/domain/repositories/user.repository';
import { InvitationStatus } from '../../domain/enum/invitation.enum';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';

@Injectable()
export class RejectInvitationUseCase {
  constructor(
    @Inject(IInvitationRepository)
    private readonly invitationRepository: IInvitationRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
  ) {}

  async execute(token: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepository.findByToken(token);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `Invitation has already been ${invitation.status.toLowerCase()}`,
      );
    }

    if (invitation.isExpired()) {
      await this.invitationRepository.updateStatus(
        invitation.id,
        InvitationStatus.EXPIRED,
      );
      throw new BadRequestException('Invitation has expired');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException(
        'This invitation was sent to a different email address',
      );
    }

    await this.invitationRepository.updateStatus(
      invitation.id,
      InvitationStatus.REJECTED,
    );

    await this.activityLogService.logUpdate(
      EntityType.INVITATION,
      invitation.id,
      userId,
      invitation.workspaceId,
      {
        previousStatus: InvitationStatus.PENDING,
        newStatus: InvitationStatus.REJECTED,
      },
    );

    // Notify workspace admins that invitation was rejected
    this.wsEmitter.emitToWorkspace(
      invitation.workspaceId,
      RealtimeEvents.INVITATION_REJECTED,
      {
        invitation: {
          id: invitation.id,
          email: invitation.email,
        },
      },
    );
  }
}
