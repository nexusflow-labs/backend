import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { IInvitationRepository } from '../../domain/repositories/invitation.repository';
import { IWorkspaceRepository } from 'src/modules/workspaces/domain/repositories/workspaces.repository';
import { IMemberRepository } from 'src/modules/members/domain/repositories/member.repository';
import { IUserRepository } from 'src/modules/auth/domain/repositories/user.repository';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';
import { InvitationStatus } from '../../domain/enum/invitation.enum';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import { Invitation } from '../../domain/entities/invitation.entity';
import { IQueueService } from 'src/infrastructure/queue/interfaces/queue.interface';
import { JobType, JobPriority } from 'src/infrastructure/queue/types/job.types';

@Injectable()
export class CreateInvitationUseCase {
  private readonly logger = new Logger(CreateInvitationUseCase.name);

  constructor(
    private readonly invitationRepository: IInvitationRepository,
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly userRepository: IUserRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly queueService: IQueueService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    inviterId: string,
    workspaceId: string,
    email: string,
    role: MemberRole,
  ): Promise<Invitation> {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const inviter = await this.memberRepository.findByWorkspaceAndUser(
      workspaceId,
      inviterId,
    );

    if (!inviter) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    if (!inviter.canManageMembers()) {
      throw new ForbiddenException(
        'You do not have permission to invite members',
      );
    }

    const invitation = await this.invitationRepository.create({
      email,
      role,
      token: randomBytes(32).toString('hex'),
      status: InvitationStatus.PENDING,
      invitedById: inviterId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      workspaceId,
    });

    await this.activityLogService.logCreate(
      EntityType.INVITATION,
      invitation.id,
      inviterId,
      {
        workspaceId,
        email,
        role,
      },
    );

    // Send invitation email
    await this.sendInvitationEmail(
      email,
      inviterId,
      workspace.name,
      invitation.token,
      invitation.expiresAt,
    );

    return invitation;
  }

  private async sendInvitationEmail(
    recipientEmail: string,
    inviterId: string,
    workspaceName: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    try {
      const inviter = await this.userRepository.findById(inviterId);
      const inviterName = inviter?.name || 'A team member';

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const inviteLink = `${frontendUrl}/invitations/accept?token=${token}`;
      // Queue the email job instead of sending directly
      await this.queueService.addJob(
        JobType.EMAIL_INVITATION,
        {
          email: recipientEmail,
          inviterName,
          workspaceName,
          inviteLink,
          expiresAt: expiresAt.toISOString(),
        },
        { priority: JobPriority.HIGH },
      );

      this.logger.log(`Invitation email queued for ${recipientEmail}`);
    } catch (error) {
      // Log the error but don't fail the invitation creation
      this.logger.error(
        `Failed to queue invitation email for ${recipientEmail}: ${error.message}`,
        error.stack,
      );
    }
  }
}
