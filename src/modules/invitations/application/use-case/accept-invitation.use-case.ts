import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { IInvitationRepository } from '../../domain/repositories/invitation.repository';
import { IMemberRepository } from 'src/modules/members/domain/repositories/member.repository';
import { IUserRepository } from 'src/modules/auth/domain/repositories/user.repository';
import { InvitationStatus } from '../../domain/enum/invitation.enum';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import { Member } from 'src/modules/members/domain/entities/member.entity';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    @Inject(IInvitationRepository)
    private readonly invitationRepository: IInvitationRepository,
    @Inject(IMemberRepository)
    private readonly memberRepository: IMemberRepository,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
  ) {}

  async execute(token: string, userId: string): Promise<Member> {
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

    const existingMember = await this.memberRepository.findByWorkspaceAndUser(
      invitation.workspaceId,
      userId,
    );

    if (existingMember) {
      throw new ConflictException('You are already a member of this workspace');
    }

    const member = await this.memberRepository.add({
      workspaceId: invitation.workspaceId,
      userId,
      role: invitation.role,
    });

    await this.invitationRepository.updateStatus(
      invitation.id,
      InvitationStatus.ACCEPTED,
    );

    await this.activityLogService.logUpdate(
      EntityType.INVITATION,
      invitation.id,
      userId,
      {
        previousStatus: InvitationStatus.PENDING,
        newStatus: InvitationStatus.ACCEPTED,
        workspaceId: invitation.workspaceId,
      },
    );

    await this.activityLogService.logCreate(
      EntityType.MEMBER,
      member.id,
      userId,
      {
        workspaceId: invitation.workspaceId,
        userId,
        role: invitation.role,
        source: 'invitation',
        invitationId: invitation.id,
      },
    );

    // Notify workspace members that invitation was accepted
    this.wsEmitter.emitToWorkspace(
      invitation.workspaceId,
      RealtimeEvents.INVITATION_ACCEPTED,
      {
        invitation: {
          id: invitation.id,
          email: invitation.email,
        },
        member: {
          id: member.id,
          userId: member.userId,
          role: member.role,
        },
      },
    );

    return member;
  }
}
