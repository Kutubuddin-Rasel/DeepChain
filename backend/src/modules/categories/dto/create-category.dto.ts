import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString()
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  readonly name: string;
}
