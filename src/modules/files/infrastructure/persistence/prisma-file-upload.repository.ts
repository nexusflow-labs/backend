import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { FileUpload } from '../../domain/entities/file-upload.entity';
import {
  CreateFileUploadData,
  IFileUploadRepository,
} from '../../domain/repositories/file-upload.repository';
import { FileUploadStatus } from '../../domain/enums/file-upload-status.enum';
import { AttachableResourceType } from '../../domain/enums/resource-type.enum';
import { FileUploadMapper } from '../mappers/file-upload.mapper';

@Injectable()
export class PrismaFileUploadRepository implements IFileUploadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateFileUploadData): Promise<FileUpload> {
    const result = await this.prisma.fileUpload.create({
      data: {
        filename: data.filename,
        contentType: data.contentType,
        storageKey: data.storageKey,
        uploaderId: data.uploaderId,
        workspaceId: data.workspaceId,
        expiresAt: data.expiresAt,
        status: FileUploadStatus.PENDING,
      },
    });

    return FileUploadMapper.toEntity(result);
  }

  async save(fileUpload: FileUpload): Promise<void> {
    await this.prisma.fileUpload.update({
      where: { id: fileUpload.id },
      data: {
        filename: fileUpload.filename,
        contentType: fileUpload.contentType,
        size: fileUpload.size,
        status: fileUpload.status,
        resourceType: fileUpload.resourceType,
        resourceId: fileUpload.resourceId,
        uploadedAt: fileUpload.uploadedAt,
        attachedAt: fileUpload.attachedAt,
      },
    });
  }

  async findById(id: string): Promise<FileUpload | null> {
    const result = await this.prisma.fileUpload.findUnique({
      where: { id },
    });

    return result ? FileUploadMapper.toEntity(result) : null;
  }

  async findByStorageKey(storageKey: string): Promise<FileUpload | null> {
    const result = await this.prisma.fileUpload.findUnique({
      where: { storageKey },
    });

    return result ? FileUploadMapper.toEntity(result) : null;
  }

  async findByResource(
    resourceType: AttachableResourceType,
    resourceId: string,
  ): Promise<FileUpload[]> {
    const results = await this.prisma.fileUpload.findMany({
      where: {
        resourceType,
        resourceId,
        status: FileUploadStatus.ATTACHED,
      },
      orderBy: { createdAt: 'asc' },
    });

    return FileUploadMapper.toEntities(results);
  }

  async findExpiredPending(limit = 100): Promise<FileUpload[]> {
    const now = new Date();

    const results = await this.prisma.fileUpload.findMany({
      where: {
        status: FileUploadStatus.PENDING,
        expiresAt: { lt: now },
      },
      take: limit,
      orderBy: { expiresAt: 'asc' },
    });

    return FileUploadMapper.toEntities(results);
  }

  async findOrphanedUploads(
    olderThan: Date,
    limit = 100,
  ): Promise<FileUpload[]> {
    const results = await this.prisma.fileUpload.findMany({
      where: {
        status: FileUploadStatus.UPLOADED,
        uploadedAt: { lt: olderThan },
      },
      take: limit,
      orderBy: { uploadedAt: 'asc' },
    });

    return FileUploadMapper.toEntities(results);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.fileUpload.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.prisma.fileUpload.deleteMany({
      where: { id: { in: ids } },
    });
  }

  countByStatus(status: FileUploadStatus): Promise<number> {
    return this.prisma.fileUpload.count({
      where: { status },
    });
  }
}
