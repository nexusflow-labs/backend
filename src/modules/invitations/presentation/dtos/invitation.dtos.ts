import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';

export class CreateInvitationDTO {
  @ApiProperty({
    description: 'Email address to invite',
    example: 'newuser@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Role to assign to the invited user',
    enum: MemberRole,
    example: MemberRole.MEMBER,
  })
  @IsNotEmpty()
  @IsEnum(MemberRole)
  role: MemberRole;
}

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'Invitation token from email',
    example: 'abc123-invitation-token',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
