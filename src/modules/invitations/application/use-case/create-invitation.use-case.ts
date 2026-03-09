import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { IInvitationRepository } from '../../domain/repositories/invitation.repository';
import { IWorkspaceRepository } from 'src/modules/workspaces/domain/repositories/workspaces.repository';
import { IMemberRepository } from 'src/modules/members/domain/repositories/member.repository';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';
import { InvitationStatus } from '../../domain/enum/invitation.enum';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import { Invitation } from '../../domain/entities/invitation.entity';

@Injectable()
export class CreateInvitationUseCase {
  constructor(
    private readonly invitationRepository: IInvitationRepository,
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly activityLogService: ActivityLogService,
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

    return invitation;
  }
}
