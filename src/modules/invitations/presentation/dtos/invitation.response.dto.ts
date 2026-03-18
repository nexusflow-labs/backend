import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from 'src/modules/members/domain/entities/member.entity';
import { InvitationStatus } from '../../domain/enum/invitation.enum';
import { Invitation } from '../../domain/entities/invitation.entity';

export class InvitationResponseDto {
  @ApiProperty({
    description: 'Invitation ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Invited email address',
    example: 'newuser@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User ID who sent the invitation',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  invitedById: string;

  @ApiProperty({
    description: 'Workspace ID',
    example: '48a30c8b-53ca-4786-9d60-942bd1c2e241',
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Role to be assigned',
    enum: MemberRole,
    example: MemberRole.MEMBER,
  })
  role: MemberRole;

  @ApiProperty({
    description: 'Invitation status',
    enum: InvitationStatus,
    example: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @ApiProperty({
    description: 'When the invitation expires',
    example: '2024-01-22T10:30:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'When the invitation was created',
    example: '2024-01-15T10:30:00.000Z',
  })
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
