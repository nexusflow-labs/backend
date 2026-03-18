import { IsEnum, IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FilterType } from '../../domain/repositories/notification.repository';

export class NotificationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter notifications by read status',
    enum: FilterType,
    example: FilterType.all,
    default: FilterType.all,
  })
  @IsOptional()
  @IsEnum(FilterType)
  filter?: FilterType = FilterType.all;

  @ApiPropertyOptional({
    description: 'Cursor for pagination',
    example: 'notification-id-123',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Number of items to return',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
