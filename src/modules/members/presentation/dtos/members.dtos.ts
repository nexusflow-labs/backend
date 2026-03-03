import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MemberRole } from '../../domain/entities/member.entity';

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
