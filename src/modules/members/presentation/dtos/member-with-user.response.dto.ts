import { MemberRole } from '../../domain/entities/member.entity';
import { MemberWithUser } from '../../domain/entities/member-with-user.entity';

export class UserResponseDto {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export class MemberWithUserResponseDto {
  id: string;
  userId: string;
  workspaceId: string;
  role: MemberRole;
  user: UserResponseDto;

  static fromEntity(entity: MemberWithUser): MemberWithUserResponseDto {
    const dto = new MemberWithUserResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.workspaceId = entity.workspaceId;
    dto.role = entity.role;
    dto.user = {
      id: entity.user.id,
      fullName: entity.user.fullName,
      email: entity.user.email,
      avatar: entity.user.avatar,
    };
    return dto;
  }

  static fromEntities(entities: MemberWithUser[]): MemberWithUserResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
