import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateWorkspaceDto {
  @IsNotEmpty({ message: 'Workspace ID must not be empty' })
  @IsString({ message: 'Workspace ID must be a string' })
  creatorId: string;

  @IsNotEmpty({ message: 'workspace must not be empty' })
  @IsString({ message: 'workspace name must be a string' })
  @MinLength(3, {
    message: 'workspace name must be at least 3 characters long',
  })
  @MaxLength(50, { message: 'workspace name must not exceed 50 characters' })
  readonly name: string;

  @IsString({ message: 'description must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'description must not exceed 255 characters' })
  readonly description?: string;
}

export class UpdateWorkspaceDto {
  @IsNotEmpty({ message: 'workspace must not be empty' })
  @IsString({ message: 'workspace name must be a string' })
  @MinLength(3, {
    message: 'workspace name must be at least 3 characters long',
  })
  @MaxLength(50, { message: 'workspace name must not exceed 50 characters' })
  readonly name: string;

  @IsString({ message: 'description must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'description must not exceed 255 characters' })
  readonly description?: string;
}
