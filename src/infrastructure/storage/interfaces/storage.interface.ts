/**
 * Storage Service Interface
 * Abstract interface for file storage operations (local, S3, etc.)
 */

export interface PresignedUrlResult {
  url: string;
  expiresAt: Date;
}

export interface FileMetadata {
  size: number;
  contentType: string;
  lastModified?: Date;
}

export interface UploadedFileInfo {
  exists: boolean;
  metadata?: FileMetadata;
}

export abstract class IStorageService {
  /**
   * Generate a pre-signed URL for file upload
   * @param key - Storage key/path for the file
   * @param contentType - MIME type of the file
   * @param expiresInSeconds - URL expiration time in seconds
   */
  abstract generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds: number,
  ): Promise<PresignedUrlResult>;

  /**
   * Generate a pre-signed URL for file download
   * @param key - Storage key/path for the file
   * @param expiresInSeconds - URL expiration time in seconds
   */
  abstract generatePresignedDownloadUrl(
    key: string,
    expiresInSeconds: number,
  ): Promise<PresignedUrlResult>;

  /**
   * Check if a file exists and get its metadata
   * @param key - Storage key/path for the file
   */
  abstract checkFileExists(key: string): Promise<UploadedFileInfo>;

  /**
   * Delete a file from storage
   * @param key - Storage key/path for the file
   */
  abstract deleteFile(key: string): Promise<void>;

  /**
   * Delete multiple files from storage
   * @param keys - Array of storage keys/paths
   */
  abstract deleteFiles(keys: string[]): Promise<void>;
}
