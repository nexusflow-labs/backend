import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';

// Storage infrastructure
import { StorageModule } from '../../infrastructure/storage/storage.module';

// Use cases
import { RegisterUploadUseCase } from './application/use-cases/register-upload.use-case';
import { ConfirmUploadUseCase } from './application/use-cases/confirm-upload.use-case';
import { AttachFileUseCase } from './application/use-cases/attach-file.use-case';
import { ListFilesUseCase } from './application/use-cases/list-files.use-case';
import { GetDownloadUrlUseCase } from './application/use-cases/get-download-url.use-case';
import { DeleteFileUseCase } from './application/use-cases/delete-file.use-case';
import { CleanupExpiredUploadsUseCase } from './application/use-cases/cleanup-expired-uploads.use-case';

// Controller
import { FilesController } from './presentation/files.controller';

// Processor
import { FileCleanupProcessor } from './infrastructure/processors/file-cleanup.processor';

@Module({
  imports: [
    StorageModule,
    MulterModule.register({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
      },
    }),
  ],
  controllers: [FilesController],
  providers: [
    // Use cases
    RegisterUploadUseCase,
    ConfirmUploadUseCase,
    AttachFileUseCase,
    ListFilesUseCase,
    GetDownloadUrlUseCase,
    DeleteFileUseCase,
    CleanupExpiredUploadsUseCase,
    // Processor
    FileCleanupProcessor,
  ],
  exports: [ListFilesUseCase],
})
export class FilesModule {}
