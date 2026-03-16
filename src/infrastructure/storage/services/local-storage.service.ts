import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  IStorageService,
  PresignedUrlResult,
  UploadedFileInfo,
} from '../interfaces/storage.interface';

/**
 * Local Storage Service
 *
 * Simulates pre-signed URL behavior for local development.
 * Uses a token-based approach where the URL contains a signed token
 * that the upload endpoint validates.
 */
@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir =
      this.configService.get<string>('UPLOAD_DIR') || './uploads';
    this.baseUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    this.secret =
      this.configService.get<string>('UPLOAD_SECRET') || 'local-dev-secret';

    // Ensure upload directory exists
    void this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create upload directory: ${error}`);
    }
  }

  /**
   * Generate a signed token for secure upload
   */
  private generateUploadToken(
    key: string,
    contentType: string,
    expiresAt: Date,
  ): string {
    const payload = `${key}:${contentType}:${expiresAt.getTime()}`;
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(payload);
    return hmac.digest('hex');
  }

  /**
   * Validate an upload token
   */
  public validateUploadToken(
    key: string,
    contentType: string,
    expiresAt: number,
    token: string,
  ): boolean {
    const payload = `${key}:${contentType}:${expiresAt}`;
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(payload);
    const expectedToken = hmac.digest('hex');

    if (token !== expectedToken) {
      return false;
    }

    // Check expiration
    if (Date.now() > expiresAt) {
      return false;
    }

    return true;
  }

  generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds: number,
  ): Promise<PresignedUrlResult> {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    const token = this.generateUploadToken(key, contentType, expiresAt);

    // Build URL with query params for validation
    const params = new URLSearchParams({
      key,
      contentType,
      expires: expiresAt.getTime().toString(),
      token,
    });

    const url = `${this.baseUrl}/files/upload?${params.toString()}`;

    return Promise.resolve({ url, expiresAt });
  }

  generatePresignedDownloadUrl(
    key: string,
    expiresInSeconds: number,
  ): Promise<PresignedUrlResult> {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    const token = this.generateUploadToken(key, '', expiresAt);

    const params = new URLSearchParams({
      key,
      expires: expiresAt.getTime().toString(),
      token,
    });

    const url = `${this.baseUrl}/files/download?${params.toString()}`;

    return Promise.resolve({ url, expiresAt });
  }

  async checkFileExists(key: string): Promise<UploadedFileInfo> {
    const filePath = path.join(this.uploadDir, key);

    try {
      const stats = await fs.stat(filePath);

      return {
        exists: true,
        metadata: {
          size: stats.size,
          contentType: 'application/octet-stream', // Would need mime detection
          lastModified: stats.mtime,
        },
      };
    } catch {
      return { exists: false };
    }
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);

    try {
      await fs.unlink(filePath);
      this.logger.debug(`Deleted file: ${key}`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        this.logger.error(`Failed to delete file ${key}: ${error}`);
        throw error;
      }
      // File doesn't exist, consider it deleted
    }
  }

  async deleteFiles(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.deleteFile(key)));
  }

  /**
   * Save uploaded file content (used by local upload endpoint)
   */
  async saveFile(key: string, content: Buffer): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    const dir = path.dirname(filePath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content);

    this.logger.debug(`Saved file: ${key} (${content.length} bytes)`);
  }

  /**
   * Get file content (used by local download endpoint)
   */
  async getFile(key: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, key);
    return fs.readFile(filePath);
  }

  /**
   * Get file path for streaming (used by local download endpoint)
   */
  getFilePath(key: string): string {
    return path.join(this.uploadDir, key);
  }
}
