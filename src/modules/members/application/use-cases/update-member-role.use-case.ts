import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IMemberRepository } from '../../domain/repositories/member.repository';
import { MemberRole } from '../../domain/entities/member.entity';

@Injectable()
export class UpdateMemberRoleUseCase {
  constructor(private readonly memberRepository: IMemberRepository) {}

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

    await this.memberRepository.updateRole(targetMember.id, newRole);
  }
}
