import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Member, MemberRole } from '../../domain/entities/member.entity';

export class MemberResponseDto {
  id: string;
  userId: string;
  workspaceId: string;
  role: MemberRole;
  createdAt: Date;

  static fromEntity(entity: Member): MemberResponseDto {
    const dto = new MemberResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.workspaceId = entity.workspaceId;
    dto.role = entity.role;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}

export class UpdateMemberRoleDto {
  @IsNotEmpty()
  @IsString()
  operationId: string;

  @IsNotEmpty()
  @IsEnum(MemberRole)
  newRole: MemberRole;
}

export class AddMemberDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsEnum(MemberRole)
  role: MemberRole;
}
