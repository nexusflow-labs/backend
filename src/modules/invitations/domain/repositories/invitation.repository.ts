import { MemberRole } from 'src/modules/members/domain/entities/member.entity';
import { Invitation } from '../entities/invitation.entity';
import { InvitationStatus } from '../enum/invitation.enum';

export interface CreateInvitationData {
  email: string;
  role: MemberRole;
  token: string;
  status: InvitationStatus;
  workspaceId: string;
  invitedById: string;
  expiresAt: Date;
}

export abstract class IInvitationRepository {
  abstract create(invitation: CreateInvitationData): Promise<Invitation>;
  abstract findById(id: string): Promise<Invitation | null>;
  abstract findByEmail(email: string): Promise<Invitation | null>;
  abstract findByToken(token: string): Promise<Invitation | null>;
  abstract listByWorkspace(workspaceId: string): Promise<Invitation[]>;
  abstract updateStatus(id: string, status: InvitationStatus): Promise<void>;
}
