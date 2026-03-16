import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IFileUploadRepository } from '../../domain/repositories/file-upload.repository';
import { IStorageService } from '../../../../infrastructure/storage/interfaces/storage.interface';

export interface RegisterUploadInput {
  filename: string;
  contentType: string;
  workspaceId?: string;
}

export interface RegisterUploadOutput {
  id: string;
  uploadUrl: string;
  expiresAt: Date;
}

// Allowed MIME types
const ALLOWED_CONTENT_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text
  'text/plain',
  'text/csv',
  'text/markdown',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];

// URL expiration time in seconds (15 minutes)
const URL_EXPIRATION_SECONDS = 15 * 60;

@Injectable()
export class RegisterUploadUseCase {
  constructor(
    @Inject(IFileUploadRepository)
    private readonly fileUploadRepository: IFileUploadRepository,
    @Inject(IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  async execute(
    input: RegisterUploadInput,
    userId: string,
  ): Promise<RegisterUploadOutput> {
    // Validate content type
    if (!ALLOWED_CONTENT_TYPES.includes(input.contentType)) {
      throw new BadRequestException(
        `Content type '${input.contentType}' is not allowed`,
      );
    }

    // Validate filename
    if (!input.filename || input.filename.length > 255) {
      throw new BadRequestException('Invalid filename');
    }

    // Generate a unique storage key
    const fileId = uuidv4();
    const sanitizedFilename = this.sanitizeFilename(input.filename);
    const storageKey = this.generateStorageKey(
      userId,
      fileId,
      sanitizedFilename,
    );

    // Generate pre-signed upload URL
    const { url, expiresAt } =
      await this.storageService.generatePresignedUploadUrl(
        storageKey,
        input.contentType,
        URL_EXPIRATION_SECONDS,
      );

    // Create file upload record
    const fileUpload = await this.fileUploadRepository.create({
      filename: input.filename,
      contentType: input.contentType,
      storageKey,
      uploaderId: userId,
      workspaceId: input.workspaceId,
      expiresAt,
    });

    return {
      id: fileUpload.id,
      uploadUrl: url,
      expiresAt,
    };
  }

  private sanitizeFilename(filename: string): string {
    // Remove path separators and special characters
    return filename
      .replace(/[/\\]/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 100);
  }

  private generateStorageKey(
    userId: string,
    fileId: string,
    filename: string,
  ): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Format: uploads/{year}/{month}/{userId}/{fileId}_{filename}
    return `uploads/${year}/${month}/${userId}/${fileId}_${filename}`;
  }
}
