import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOrder {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  NEWEST = 'newest',
}

export class QueryMenuItemDto {
  @IsOptional()
  @IsString()
  readonly search?: string;

  @IsOptional()
  @IsUUID('4')
  readonly category?: string;

  @IsOptional()
  @IsString()
  readonly available?: string;

  @IsOptional()
  @Type(() => Number)
  readonly page?: number;

  @IsOptional()
  @Type(() => Number)
  readonly limit?: number;

  @IsOptional()
  @IsEnum(SortOrder)
  readonly sort?: SortOrder;
}
