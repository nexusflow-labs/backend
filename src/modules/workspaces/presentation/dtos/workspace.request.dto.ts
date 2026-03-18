import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({
    description: 'Workspace name',
    example: 'My Workspace',
    minLength: 3,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'workspace must not be empty' })
  @IsString({ message: 'workspace name must be a string' })
  @MinLength(3, {
    message: 'workspace name must be at least 3 characters long',
  })
  @MaxLength(50, { message: 'workspace name must not exceed 50 characters' })
  readonly name: string;

  @ApiPropertyOptional({
    description: 'Workspace description',
    example: 'A workspace for team collaboration',
    maxLength: 255,
  })
  @IsString({ message: 'description must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'description must not exceed 255 characters' })
  readonly description?: string;
}

export class UpdateWorkspaceDto {
  @ApiProperty({
    description: 'Workspace name',
    example: 'Updated Workspace Name',
    minLength: 3,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'workspace must not be empty' })
  @IsString({ message: 'workspace name must be a string' })
  @MinLength(3, {
    message: 'workspace name must be at least 3 characters long',
  })
  @MaxLength(50, { message: 'workspace name must not exceed 50 characters' })
  readonly name: string;

  @ApiPropertyOptional({
    description: 'Workspace description',
    example: 'Updated description',
    maxLength: 255,
  })
  @IsString({ message: 'description must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'description must not exceed 255 characters' })
  readonly description?: string;
}
