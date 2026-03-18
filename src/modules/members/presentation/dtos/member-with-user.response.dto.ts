import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemberRole } from '../../domain/entities/member.entity';
import { MemberWithUser } from '../../domain/entities/member-with-user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'c7b7649c-7390-4494-8fe7-c21df469fc09',
  })
  id: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatar?: string;
}

export class MemberWithUserResponseDto {
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
    description: 'Member role',
    enum: MemberRole,
    example: MemberRole.MEMBER,
  })
  role: MemberRole;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
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
