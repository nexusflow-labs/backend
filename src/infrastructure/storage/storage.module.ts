import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from './interfaces/storage.interface';
import { LocalStorageService } from './services/local-storage.service';

/**
 * Storage Module
 *
 * Provides file storage capabilities with support for:
 * - Local storage (development)
 * - S3/MinIO (production)
 *
 * The storage provider is selected based on environment configuration.
 */
@Global()
@Module({
  providers: [
    LocalStorageService, // Always provide for local upload endpoint
    {
      provide: IStorageService,
      useFactory: async (
        configService: ConfigService,
        localStorageService: LocalStorageService,
      ) => {
        const logger = new Logger('StorageModule');
        const storageType =
          configService.get<string>('STORAGE_TYPE') || 'local';

        if (storageType === 's3') {
          try {
            // Dynamically import S3 service to avoid requiring AWS SDK in local dev
            const { S3StorageService } =
              await import('./services/s3-storage.service');
            logger.log('Using S3 storage');
            return new S3StorageService(configService) as IStorageService;
          } catch {
            logger.warn(
              'Failed to load S3 storage, falling back to local storage',
            );
            return localStorageService;
          }
        }

        logger.log('Using local storage');
        return localStorageService;
      },
      inject: [ConfigService, LocalStorageService],
    },
  ],
  exports: [IStorageService, LocalStorageService],
})
export class StorageModule {}
