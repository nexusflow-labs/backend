import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { IMemberRepository } from '../../domain/repositories/member.repository';
import { MemberRole } from '../../domain/entities/member.entity';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';

@Injectable()
export class UpdateMemberRoleUseCase {
  constructor(
    @Inject(IMemberRepository)
    private readonly memberRepository: IMemberRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
  ) {}

  async execute(
    workspaceId: string,
    operatorId: string,
    targetUserId: string,
    newRole: MemberRole,
  ): Promise<void> {
    const operator = await this.memberRepository.findByWorkspaceAndUser(
      workspaceId,
      operatorId,
    );

    if (!operator || !operator.canManageMembers()) {
      throw new ForbiddenException(
        'You do not have permission to update member roles',
      );
    }

    const targetMember = await this.memberRepository.findByWorkspaceAndUser(
      workspaceId,
      targetUserId,
    );

    if (!targetMember) {
      throw new NotFoundException('Target member not found');
    }

    // Admin cannot change role of the owner
    if (operator.isAdmin() && targetMember.isOwner()) {
      throw new ForbiddenException('Admin cannot change role of the owner');
    }

    // Workspace must have at least one owner
    if (targetMember.isOwner() && newRole !== MemberRole.OWNER) {
      const members = await this.memberRepository.listByWorkspace(workspaceId);
      const ownerCount = members.filter((m) => m.isOwner()).length;

      if (ownerCount <= 1) {
        throw new BadRequestException('Workspace must have at least one owner');
      }
    }

    const oldRole = targetMember.role;
    await this.memberRepository.updateRole(targetMember.id, newRole);

    await this.activityLogService.logUpdate(
      EntityType.MEMBER,
      targetMember.id,
      operatorId,
      { workspaceId, targetUserId, oldRole, newRole },
    );

    this.wsEmitter.emitToWorkspace(
      workspaceId,
      RealtimeEvents.MEMBER_ROLE_CHANGED,
      {
        memberId: targetMember.id,
        userId: targetUserId,
        oldRole,
        newRole,
        changedBy: operatorId,
      },
    );

    // Notify the user whose role was changed
    this.wsEmitter.emitToUser(
      targetUserId,
      RealtimeEvents.MEMBER_ROLE_CHANGED,
      {
        workspaceId,
        oldRole,
        newRole,
      },
    );
  }
}
