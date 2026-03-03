import { Member, MemberRole } from '../entities/member.entity';
import { MemberWithUser } from '../entities/member-with-user.entity';

export interface AddMemberData {
  workspaceId: string;
  userId: string;
  role: MemberRole;
}

export abstract class IMemberRepository {
  abstract add(data: AddMemberData): Promise<Member>;
  abstract updateRole(id: string, role: MemberRole): Promise<void>;
  abstract findByWorkspaceAndUser(
    workspaceId: string,
    userId: string,
  ): Promise<Member | null>;
  abstract listByWorkspace(workspaceId: string): Promise<Member[]>;
  abstract listMembersWithUser(workspaceId: string): Promise<MemberWithUser[]>;
  abstract delete(id: string): Promise<void>;
  abstract removeMember(workspaceId: string, userId: string): Promise<void>;
}
