import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  readonly email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  readonly password: string;
}
