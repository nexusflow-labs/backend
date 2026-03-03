import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IMemberRepository } from '../../domain/repositories/member.repository';

@Injectable()
export class RemoveMemberUseCase {
  constructor(private readonly memberRepository: IMemberRepository) {}

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

    await this.memberRepository.removeMember(workspaceId, targetUserId);
  }
}
