import { IsEnum, IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { FilterType } from '../../domain/repositories/notification.repository';

export class NotificationQueryDto {
  @IsOptional()
  @IsEnum(FilterType)
  filter?: FilterType = FilterType.all;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
