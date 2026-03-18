import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabelDto {
  @ApiProperty({
    description: 'Label name',
    example: 'Bug',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    description: 'Label color (hex format)',
    example: '#FF5733',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color (e.g., #6B7280)',
  })
  color?: string;
}

export class UpdateLabelDto {
  @ApiPropertyOptional({
    description: 'Label name',
    example: 'Feature',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    description: 'Label color (hex format)',
    example: '#3B82F6',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color (e.g., #6B7280)',
  })
  color?: string;
}
