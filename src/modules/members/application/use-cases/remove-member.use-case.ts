import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IMemberRepository } from '../../domain/repositories/member.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';

@Injectable()
export class RemoveMemberUseCase {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
  ) {}

  async execute(
    workspaceId: string,
    operatorId: string,
    targetUserId: string,
  ): Promise<void> {
    const target = await this.memberRepository.findByWorkspaceAndUser(
      workspaceId,
      targetUserId,
    );
    if (!target) {
      throw new NotFoundException('Member not found in this workspace');
    }

    if (operatorId !== targetUserId) {
      const operator = await this.memberRepository.findByWorkspaceAndUser(
        workspaceId,
        operatorId,
      );
      if (!operator || !operator.canManageMembers()) {
        throw new ForbiddenException(
          'You do not have permission to remove members.',
        );
      }

      if (operator.isAdmin() && target.isOwner()) {
        throw new ForbiddenException('Admin cannot remove Owner');
      }
    }

    if (target.isOwner()) {
      const allMembers =
        await this.memberRepository.listByWorkspace(workspaceId);
      const owners = allMembers.filter((m) => m.isOwner());

      if (owners.length <= 1) {
        throw new BadRequestException(
          'Cannot remove the last Owner. Please transfer ownership to another member or delete the workspace.',
        );
      }
    }

    const memberId = target.id;
    const role = target.role;

    await this.memberRepository.removeMember(workspaceId, targetUserId);

    await this.activityLogService.logDelete(
      EntityType.MEMBER,
      memberId,
      operatorId,
      { workspaceId, targetUserId, role },
    );

    this.wsEmitter.emitToWorkspace(workspaceId, RealtimeEvents.MEMBER_REMOVED, {
      memberId,
      userId: targetUserId,
      removedBy: operatorId,
    });

    // Notify the removed user
    this.wsEmitter.emitToUser(targetUserId, RealtimeEvents.MEMBER_REMOVED, {
      workspaceId,
    });
  }
}
