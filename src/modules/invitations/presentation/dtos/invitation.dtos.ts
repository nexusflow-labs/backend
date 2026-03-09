import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';

export class CreateInvitationDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsEnum(MemberRole)
  role: MemberRole;
}

export class AcceptInvitationDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
