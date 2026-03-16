import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IFileUploadRepository } from '../../domain/repositories/file-upload.repository';
import { IStorageService } from '../../../../infrastructure/storage/interfaces/storage.interface';

@Injectable()
export class DeleteFileUseCase {
  constructor(
    @Inject(IFileUploadRepository)
    private readonly fileUploadRepository: IFileUploadRepository,
    @Inject(IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  async execute(fileId: string, userId: string): Promise<void> {
    const fileUpload = await this.fileUploadRepository.findById(fileId);

    if (!fileUpload) {
      throw new NotFoundException('File not found');
    }

    // Only the uploader can delete the file
    if (fileUpload.uploaderId !== userId) {
      throw new ForbiddenException('You can only delete files you uploaded');
    }

    // Delete from storage
    try {
      await this.storageService.deleteFile(fileUpload.storageKey);
    } catch (error) {
      // Log but continue - storage might already be cleaned up
      console.warn(`Failed to delete file from storage: ${error}`);
    }

    // Delete the record
    await this.fileUploadRepository.delete(fileId);
  }
}
