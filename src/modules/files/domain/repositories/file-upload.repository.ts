import { FileUpload } from '../entities/file-upload.entity';
import { FileUploadStatus } from '../enums/file-upload-status.enum';
import { AttachableResourceType } from '../enums/resource-type.enum';

export interface CreateFileUploadData {
  filename: string;
  contentType: string;
  storageKey: string;
  uploaderId: string;
  workspaceId?: string;
  expiresAt: Date;
}

export interface FileUploadFilters {
  status?: FileUploadStatus;
  resourceType?: AttachableResourceType;
  resourceId?: string;
  uploaderId?: string;
  workspaceId?: string;
}

export abstract class IFileUploadRepository {
  /**
   * Create a new file upload record
   */
  abstract create(data: CreateFileUploadData): Promise<FileUpload>;

  /**
   * Save changes to an existing file upload
   */
  abstract save(fileUpload: FileUpload): Promise<void>;

  /**
   * Find a file upload by ID
   */
  abstract findById(id: string): Promise<FileUpload | null>;

  /**
   * Find a file upload by storage key
   */
  abstract findByStorageKey(storageKey: string): Promise<FileUpload | null>;

  /**
   * Find file uploads by resource
   */
  abstract findByResource(
    resourceType: AttachableResourceType,
    resourceId: string,
  ): Promise<FileUpload[]>;

  /**
   * Find expired pending uploads (for cleanup)
   */
  abstract findExpiredPending(limit?: number): Promise<FileUpload[]>;

  /**
   * Find orphaned uploads (uploaded but not attached after a period)
   */
  abstract findOrphanedUploads(
    olderThan: Date,
    limit?: number,
  ): Promise<FileUpload[]>;

  /**
   * Delete a file upload record
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Delete multiple file upload records
   */
  abstract deleteMany(ids: string[]): Promise<void>;

  /**
   * Count uploads by status
   */
  abstract countByStatus(status: FileUploadStatus): Promise<number>;
}
