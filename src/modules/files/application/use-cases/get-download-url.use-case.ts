import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IFileUploadRepository } from '../../domain/repositories/file-upload.repository';
import { IStorageService } from '../../../../infrastructure/storage/interfaces/storage.interface';

export interface GetDownloadUrlOutput {
  downloadUrl: string;
  filename: string;
  contentType: string;
  size: number | null;
  expiresAt: Date;
}

// Download URL expiration time in seconds (1 hour)
const DOWNLOAD_URL_EXPIRATION_SECONDS = 60 * 60;

@Injectable()
export class GetDownloadUrlUseCase {
  constructor(
    @Inject(IFileUploadRepository)
    private readonly fileUploadRepository: IFileUploadRepository,
    @Inject(IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  async execute(fileId: string): Promise<GetDownloadUrlOutput> {
    const fileUpload = await this.fileUploadRepository.findById(fileId);

    if (!fileUpload) {
      throw new NotFoundException('File not found');
    }

    if (!fileUpload.isAttached()) {
      throw new BadRequestException('File is not attached to any resource');
    }

    const { url, expiresAt } =
      await this.storageService.generatePresignedDownloadUrl(
        fileUpload.storageKey,
        DOWNLOAD_URL_EXPIRATION_SECONDS,
      );

    return {
      downloadUrl: url,
      filename: fileUpload.filename,
      contentType: fileUpload.contentType,
      size: fileUpload.size ?? null,
      expiresAt,
    };
  }
}
