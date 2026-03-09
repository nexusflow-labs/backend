import { Invitation as PrismaInvitation } from 'generated/prisma/browser';
import { Invitation } from '../../domain/entities/invitation.entity';
import { InvitationStatus } from '../../domain/enum/invitation.enum';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';

export class InvitationMapper {
  static toEntity(raw: PrismaInvitation): Invitation {
    return Invitation.reconstitute({
      id: raw.id,
      email: raw.email,
      role: raw.role as MemberRole,
      token: raw.token,
      status: raw.status as InvitationStatus,
      workspaceId: raw.workspaceId,
      invitedById: raw.invitedById,
      expiresAt: raw.expiresAt,
      createdAt: raw.createdAt,
    });
  }
}
