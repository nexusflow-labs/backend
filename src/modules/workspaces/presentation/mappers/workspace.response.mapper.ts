import { Workspace } from '../../domain/entities/workspace.entity';
import { WorkspaceResponseDto } from '../dtos/workspace.response.dto';

export class WorkspaceResponseMapper {
  static entitytoWorkspaceResponse(entity: Workspace): WorkspaceResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
