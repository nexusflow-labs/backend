import { Label } from '../../domain/entities/label.entity';

export class LabelResponseDto {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
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
