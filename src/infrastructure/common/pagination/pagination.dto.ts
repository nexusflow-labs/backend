import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class SortableDto {
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  @Transform(({ value }): 'asc' | 'desc' | undefined =>
    typeof value === 'string'
      ? (value.toLowerCase() as 'asc' | 'desc')
      : undefined,
  )
  sortDirection?: 'asc' | 'desc' = 'desc';
}

export class PaginatedSortableDto extends PaginationDto {
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  @Transform(({ value }): 'asc' | 'desc' | undefined =>
    typeof value === 'string'
      ? (value.toLowerCase() as 'asc' | 'desc')
      : undefined,
  )
  sortDirection?: 'asc' | 'desc' = 'desc';
}
