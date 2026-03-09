import { MemberRole } from 'src/modules/members/domain/entities/member.entity';
import { InvitationStatus } from '../../domain/enum/invitation.enum';
import { Invitation } from '../../domain/entities/invitation.entity';

export class InvitationResponseDto {
  id: string;
  email: string;
  invitedById: string;
  workspaceId: string;
  role: MemberRole;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;

  static fromEntity(entity: Invitation): InvitationResponseDto {
    const dto = new InvitationResponseDto();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.status = entity.status;
    dto.role = entity.role;
    dto.invitedById = entity.invitedById;
    dto.workspaceId = entity.workspaceId;
    dto.createdAt = entity.createdAt;
    dto.expiresAt = entity.expiresAt;
    return dto;
  }
}
