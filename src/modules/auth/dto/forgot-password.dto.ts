import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDTO {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email format' })
  email: string;
}
