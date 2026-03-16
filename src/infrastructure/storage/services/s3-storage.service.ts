import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  IStorageService,
  PresignedUrlResult,
  UploadedFileInfo,
} from '../interfaces/storage.interface';

/**
 * S3 Storage Service
 *
 * Uses AWS S3 (or compatible services like MinIO) for file storage.
 * Generates real pre-signed URLs that clients can use directly.
 */
@Injectable()
export class S3StorageService implements IStorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    const endpoint = this.configService.get<string>('S3_ENDPOINT'); // For MinIO
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    this.bucket =
      this.configService.get<string>('S3_BUCKET') || 'nexusflow-uploads';

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
      forcePathStyle: !!endpoint, // Required for MinIO
    });

    this.logger.log(`S3 Storage initialized - Bucket: ${this.bucket}`);
  }

  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds: number,
  ): Promise<PresignedUrlResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    return { url, expiresAt };
  }

  async generatePresignedDownloadUrl(
    key: string,
    expiresInSeconds: number,
  ): Promise<PresignedUrlResult> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    return { url, expiresAt };
  }

  async checkFileExists(key: string): Promise<UploadedFileInfo> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        exists: true,
        metadata: {
          size: response.ContentLength || 0,
          contentType: response.ContentType || 'application/octet-stream',
          lastModified: response.LastModified,
        },
      };
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return { exists: false };
      }
      this.logger.error(`Failed to check file existence: ${error}`);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.debug(`Deleted file from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${error}`);
      throw error;
    }
  }

  async deleteFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    // S3 allows up to 1000 objects per delete request
    const batches: string[][] = [];
    for (let i = 0; i < keys.length; i += 1000) {
      batches.push(keys.slice(i, i + 1000));
    }

    for (const batch of batches) {
      try {
        const command = new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects: batch.map((key) => ({ Key: key })),
            Quiet: true,
          },
        });

        await this.s3Client.send(command);
        this.logger.debug(`Deleted ${batch.length} files from S3`);
      } catch (error) {
        this.logger.error(`Failed to delete files from S3: ${error}`);
        throw error;
      }
    }
  }
}
