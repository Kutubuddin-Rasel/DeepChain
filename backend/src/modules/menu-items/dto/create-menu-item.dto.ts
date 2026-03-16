import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMenuItemDto {
  @IsNotEmpty({ message: 'Item name is required' })
  @IsString()
  @MaxLength(200)
  readonly name: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @MaxLength(1000)
  readonly description: string;

  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0.01, { message: 'Price must be greater than 0' })
  readonly price: number;

  @IsNotEmpty({ message: 'Category is required' })
  @IsUUID('4', { message: 'Invalid category ID' })
  readonly categoryId: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    if (typeof value === 'number') return value === 1;
    return Boolean(value);
  })
  @IsBoolean()
  readonly available?: boolean;

  @IsOptional()
  readonly image?: any;
}
