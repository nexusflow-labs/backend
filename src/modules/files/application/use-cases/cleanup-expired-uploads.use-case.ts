import { Injectable, Inject, Logger } from '@nestjs/common';
import { IFileUploadRepository } from '../../domain/repositories/file-upload.repository';
import { IStorageService } from '../../../../infrastructure/storage/interfaces/storage.interface';

export interface CleanupResult {
  expiredCount: number;
  orphanedCount: number;
  storageDeletedCount: number;
  errors: string[];
}

// Files uploaded but not attached for more than 24 hours are considered orphaned
const ORPHAN_THRESHOLD_HOURS = 24;

@Injectable()
export class CleanupExpiredUploadsUseCase {
  private readonly logger = new Logger(CleanupExpiredUploadsUseCase.name);

  constructor(
    @Inject(IFileUploadRepository)
    private readonly fileUploadRepository: IFileUploadRepository,
    @Inject(IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  async execute(): Promise<CleanupResult> {
    const result: CleanupResult = {
      expiredCount: 0,
      orphanedCount: 0,
      storageDeletedCount: 0,
      errors: [],
    };

    // 1. Clean up expired pending uploads
    await this.cleanupExpiredPending(result);

    // 2. Clean up orphaned uploads (uploaded but never attached)
    await this.cleanupOrphanedUploads(result);

    this.logger.log(
      `Cleanup completed: ${result.expiredCount} expired, ${result.orphanedCount} orphaned, ${result.storageDeletedCount} files deleted from storage`,
    );

    if (result.errors.length > 0) {
      this.logger.warn(`Cleanup errors: ${result.errors.join(', ')}`);
    }

    return result;
  }

  private async cleanupExpiredPending(result: CleanupResult): Promise<void> {
    const expiredUploads =
      await this.fileUploadRepository.findExpiredPending(100);

    if (expiredUploads.length === 0) {
      return;
    }

    const idsToDelete: string[] = [];

    for (const upload of expiredUploads) {
      try {
        // Check if file was actually uploaded despite pending status
        const fileInfo = await this.storageService.checkFileExists(
          upload.storageKey,
        );

        if (fileInfo.exists) {
          // File was uploaded, delete from storage
          await this.storageService.deleteFile(upload.storageKey);
          result.storageDeletedCount++;
        }

        idsToDelete.push(upload.id);
        result.expiredCount++;
      } catch (error) {
        result.errors.push(
          `Failed to cleanup expired upload ${upload.id}: ${error}`,
        );
      }
    }

    // Delete records
    if (idsToDelete.length > 0) {
      await this.fileUploadRepository.deleteMany(idsToDelete);
    }
  }

  private async cleanupOrphanedUploads(result: CleanupResult): Promise<void> {
    const orphanThreshold = new Date();
    orphanThreshold.setHours(
      orphanThreshold.getHours() - ORPHAN_THRESHOLD_HOURS,
    );

    const orphanedUploads = await this.fileUploadRepository.findOrphanedUploads(
      orphanThreshold,
      100,
    );

    if (orphanedUploads.length === 0) {
      return;
    }

    const idsToDelete: string[] = [];
    const keysToDelete: string[] = [];

    for (const upload of orphanedUploads) {
      keysToDelete.push(upload.storageKey);
      idsToDelete.push(upload.id);
      result.orphanedCount++;
    }

    // Batch delete from storage
    try {
      await this.storageService.deleteFiles(keysToDelete);
      result.storageDeletedCount += keysToDelete.length;
    } catch (error) {
      result.errors.push(`Failed to batch delete orphaned files: ${error}`);
    }

    // Delete records
    if (idsToDelete.length > 0) {
      await this.fileUploadRepository.deleteMany(idsToDelete);
    }
  }
}
