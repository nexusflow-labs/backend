import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttachableResourceType } from '../../domain/enums/resource-type.enum';

export class RegisterUploadDto {
  @ApiProperty({
    description: 'Original filename',
    example: 'document.pdf',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  filename: string;

  @ApiProperty({
    description: 'MIME content type',
    example: 'application/pdf',
  })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiPropertyOptional({
    description: 'Workspace ID for access control',
    example: '48a30c8b-53ca-4786-9d60-942bd1c2e241',
  })
  @IsOptional()
  @IsUUID()
  workspaceId?: string;
}

export class AttachFileDto {
  @ApiProperty({
    description: 'File ID from registration step',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  fileId: string;
}

export class AttachFileParamsDto {
  @ApiProperty({
    description: 'Resource type to attach to',
    enum: AttachableResourceType,
    example: AttachableResourceType.TASK,
  })
  @IsEnum(AttachableResourceType)
  resourceType: AttachableResourceType;

  @ApiProperty({
    description: 'Resource ID to attach to',
    example: '98afcc31-ce1e-4573-a477-2ea2ce659515',
  })
  @IsUUID()
  resourceId: string;
}
