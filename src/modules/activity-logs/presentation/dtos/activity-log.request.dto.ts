import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { EntityType } from '../../domain/enums/entity-type.enum';

export class ActivityLogFilterDto {
  @IsEnum(EntityType)
  @IsOptional()
  entityType?: EntityType;

  @IsUUID()
  @IsOptional()
  entityId?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;
}
