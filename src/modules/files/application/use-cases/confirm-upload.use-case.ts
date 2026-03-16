import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IFileUploadRepository } from '../../domain/repositories/file-upload.repository';
import { IStorageService } from '../../../../infrastructure/storage/interfaces/storage.interface';
import { FileUpload } from '../../domain/entities/file-upload.entity';
import { FileUploadStatus } from '../../domain/enums/file-upload-status.enum';

/**
 * Internal use case to confirm that a file has been uploaded to storage.
 * This is called by the attach use case, not directly by the user.
 */
@Injectable()
export class ConfirmUploadUseCase {
  constructor(
    @Inject(IFileUploadRepository)
    private readonly fileUploadRepository: IFileUploadRepository,
    @Inject(IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  /**
   * Check if a file has been uploaded and update its status if so.
   * Returns the updated file upload entity.
   */
  async execute(fileId: string): Promise<FileUpload> {
    // Find the file upload record
    const fileUpload = await this.fileUploadRepository.findById(fileId);

    if (!fileUpload) {
      throw new NotFoundException('File upload not found');
    }

    // If already uploaded or attached, return as-is
    if (
      fileUpload.status === FileUploadStatus.UPLOADED ||
      fileUpload.status === FileUploadStatus.ATTACHED
    ) {
      return fileUpload;
    }

    // Check if URL has expired
    if (fileUpload.isExpired()) {
      fileUpload.markAsExpired();
      await this.fileUploadRepository.save(fileUpload);
      throw new BadRequestException('Upload URL has expired');
    }

    // Check if file exists in storage
    const fileInfo = await this.storageService.checkFileExists(
      fileUpload.storageKey,
    );

    if (!fileInfo.exists || !fileInfo.metadata) {
      throw new BadRequestException('File has not been uploaded yet');
    }

    // Mark as uploaded with actual file size
    fileUpload.markAsUploaded(fileInfo.metadata.size);
    await this.fileUploadRepository.save(fileUpload);

    return fileUpload;
  }
}
