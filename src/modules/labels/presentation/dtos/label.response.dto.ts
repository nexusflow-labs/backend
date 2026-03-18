import { ApiProperty } from '@nestjs/swagger';
import { Label } from '../../domain/entities/label.entity';

export class LabelResponseDto {
  @ApiProperty({
    description: 'Label ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Label name',
    example: 'Bug',
  })
  name: string;

  @ApiProperty({
    description: 'Label color (hex)',
    example: '#FF5733',
  })
  color: string;

  @ApiProperty({
    description: 'Workspace ID',
    example: '48a30c8b-53ca-4786-9d60-942bd1c2e241',
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  static fromEntity(entity: Label): LabelResponseDto {
    const dto = new LabelResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.color = entity.color;
    dto.workspaceId = entity.workspaceId;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static fromEntities(entities: Label[]): LabelResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
