import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { AttachableResourceType } from '../../domain/enums/resource-type.enum';

export class RegisterUploadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsOptional()
  @IsUUID()
  workspaceId?: string;
}

export class AttachFileDto {
  @IsUUID()
  @IsNotEmpty()
  fileId: string;
}

export class AttachFileParamsDto {
  @IsEnum(AttachableResourceType)
  resourceType: AttachableResourceType;

  @IsUUID()
  resourceId: string;
}
