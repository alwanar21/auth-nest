import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDTO {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
