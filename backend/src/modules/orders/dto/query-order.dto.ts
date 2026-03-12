import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryOrderDto {
  @IsOptional()
  @Type(() => Number)
  readonly page?: number;

  @IsOptional()
  @Type(() => Number)
  readonly limit?: number;
}
