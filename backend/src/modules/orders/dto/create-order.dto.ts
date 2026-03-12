import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNotEmpty({ message: 'Menu item ID is required' })
  @IsUUID('4', { message: 'Invalid menu item ID' })
  readonly menuItemId: string;

  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  readonly quantity: number;
}

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Delivery address is required' })
  @IsString()
  readonly address: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Order must contain at least one item' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  readonly items: OrderItemDto[];
}
