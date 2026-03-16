import { FileUpload as PrismaFileUpload } from 'generated/prisma/browser';
import { FileUpload } from '../../domain/entities/file-upload.entity';
import { FileUploadStatus } from '../../domain/enums/file-upload-status.enum';
import { AttachableResourceType } from '../../domain/enums/resource-type.enum';

export class FileUploadMapper {
  static toEntity(raw: PrismaFileUpload): FileUpload {
    return FileUpload.reconstitute({
      id: raw.id,
      filename: raw.filename,
      contentType: raw.contentType,
      size: raw.size,
      storageKey: raw.storageKey,
      status: raw.status as FileUploadStatus,
      resourceType: raw.resourceType as AttachableResourceType | null,
      resourceId: raw.resourceId,
      uploaderId: raw.uploaderId,
      workspaceId: raw.workspaceId,
      expiresAt: raw.expiresAt,
      uploadedAt: raw.uploadedAt,
      attachedAt: raw.attachedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toEntities(raws: PrismaFileUpload[]): FileUpload[] {
    return raws.map((raw) => this.toEntity(raw));
  }
}
