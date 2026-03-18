import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileUpload } from '../../domain/entities/file-upload.entity';
import { FileUploadStatus } from '../../domain/enums/file-upload-status.enum';
import { AttachableResourceType } from '../../domain/enums/resource-type.enum';

export class RegisterUploadResponseDto {
  @ApiProperty({
    description: 'File ID for tracking',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Pre-signed upload URL',
    example: 'http://localhost:3000/files/upload?key=...',
  })
  uploadUrl: string;

  @ApiProperty({
    description: 'URL expiration time',
    example: '2024-01-15T11:30:00.000Z',
  })
  expiresAt: Date;
}

export class FileUploadResponseDto {
  @ApiProperty({
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'document.pdf',
  })
  filename: string;

  @ApiProperty({
    description: 'MIME content type',
    example: 'application/pdf',
  })
  contentType: string;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 102400,
    nullable: true,
  })
  size: number | null;

  @ApiProperty({
    description: 'Upload status',
    enum: FileUploadStatus,
    example: FileUploadStatus.ATTACHED,
  })
  status: FileUploadStatus;

  @ApiPropertyOptional({
    description: 'Attached resource type',
    enum: AttachableResourceType,
    nullable: true,
  })
  resourceType: AttachableResourceType | null;

  @ApiPropertyOptional({
    description: 'Attached resource ID',
    example: '98afcc31-ce1e-4573-a477-2ea2ce659515',
    nullable: true,
  })
  resourceId: string | null;

  @ApiPropertyOptional({
    description: 'When the file was uploaded',
    example: '2024-01-15T10:30:00.000Z',
    nullable: true,
  })
  uploadedAt: Date | null;

  @ApiPropertyOptional({
    description: 'When the file was attached to a resource',
    example: '2024-01-15T10:35:00.000Z',
    nullable: true,
  })
  attachedAt: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  static fromEntity(entity: FileUpload): FileUploadResponseDto {
    const dto = new FileUploadResponseDto();
    dto.id = entity.id;
    dto.filename = entity.filename;
    dto.contentType = entity.contentType;
    dto.size = entity.size ?? null;
    dto.status = entity.status;
    dto.resourceType = entity.resourceType ?? null;
    dto.resourceId = entity.resourceId ?? null;
    dto.uploadedAt = entity.uploadedAt ?? null;
    dto.attachedAt = entity.attachedAt ?? null;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static fromEntities(entities: FileUpload[]): FileUploadResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}

export class DownloadUrlResponseDto {
  @ApiProperty({
    description: 'Pre-signed download URL',
    example: 'http://localhost:3000/files/download?key=...',
  })
  downloadUrl: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'document.pdf',
  })
  filename: string;

  @ApiProperty({
    description: 'MIME content type',
    example: 'application/pdf',
  })
  contentType: string;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 102400,
    nullable: true,
  })
  size: number | null;

  @ApiProperty({
    description: 'URL expiration time',
    example: '2024-01-15T11:30:00.000Z',
  })
  expiresAt: Date;
}
