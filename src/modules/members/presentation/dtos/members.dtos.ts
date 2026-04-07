import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Member, MemberRole } from '../../domain/entities/member.entity';

export class MemberResponseDto {
  @ApiProperty({
    description: 'Member ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  userId: string;

  @ApiProperty({
    description: 'Workspace ID',
    example: '48a30c8b-53ca-4786-9d60-942bd1c2e241',
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Member role in workspace',
    enum: MemberRole,
    example: MemberRole.MEMBER,
  })
  role: MemberRole;

  @ApiProperty({
    description: 'When the membership was created',
    example: '2024-01-15T10:30:00.000Z',
  })
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
  @ApiProperty({
    description: 'New role for the member',
    enum: MemberRole,
    example: MemberRole.ADMIN,
  })
  @IsNotEmpty()
  @IsEnum(MemberRole)
  newRole: MemberRole;
}

export class AddMemberDto {
  @ApiProperty({
    description: 'User ID to add as member',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Role to assign to the new member',
    enum: MemberRole,
    example: MemberRole.MEMBER,
  })
  @IsNotEmpty()
  @IsEnum(MemberRole)
  role: MemberRole;
}
