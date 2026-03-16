import { FileUpload } from '../../domain/entities/file-upload.entity';
import { FileUploadStatus } from '../../domain/enums/file-upload-status.enum';
import { AttachableResourceType } from '../../domain/enums/resource-type.enum';

export class RegisterUploadResponseDto {
  id: string;
  uploadUrl: string;
  expiresAt: Date;
}

export class FileUploadResponseDto {
  id: string;
  filename: string;
  contentType: string;
  size: number | null;
  status: FileUploadStatus;
  resourceType: AttachableResourceType | null;
  resourceId: string | null;
  uploadedAt: Date | null;
  attachedAt: Date | null;
  createdAt: Date;

  static fromEntity(entity: FileUpload): FileUploadResponseDto {
    const dto = new FileUploadResponseDto();
    dto.id = entity.id;
    dto.filename = entity.filename;
    dto.contentType = entity.contentType;
    dto.size = entity.size ?? null;
    dto.status = entity.status;
    dto.resourceType = entity.resourceType ?? null;
    dto.resourceId = entity.resourceId ?? null;
    dto.uploadedAt = entity.uploadedAt ?? null;
    dto.attachedAt = entity.attachedAt ?? null;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static fromEntities(entities: FileUpload[]): FileUploadResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}

export class DownloadUrlResponseDto {
  downloadUrl: string;
  filename: string;
  contentType: string;
  size: number | null;
  expiresAt: Date;
}
