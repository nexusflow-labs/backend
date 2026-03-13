import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { IMemberRepository } from '../../domain/repositories/member.repository';
import { ActivityLogService } from 'src/modules/activity-logs/application/services/activity-log.service';
import { EntityType } from 'src/modules/activity-logs/domain/enums/entity-type.enum';
import {
  WebsocketEmitterService,
  RealtimeEvents,
} from 'src/infrastructure/realtime';
import { CreateNotificationUseCase } from 'src/modules/notifications/applications/use-case/create-notification.use-case';
import { NotificationType } from 'src/modules/notifications/domain/entities/notification.enum';

@Injectable()
export class RemoveMemberUseCase {
  constructor(
    @Inject(IMemberRepository)
    private readonly memberRepository: IMemberRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly wsEmitter: WebsocketEmitterService,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
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

    // Create in-app notification for the removed user (skip if self-remove)
    if (targetUserId !== operatorId) {
      await this.createNotificationUseCase.execute(
        targetUserId,
        NotificationType.MEMBER_REMOVED,
        EntityType.MEMBER,
        memberId,
        'You have been removed from a workspace',
        operatorId,
        workspaceId,
        undefined,
        { workspaceId },
      );
    }
  }
}
