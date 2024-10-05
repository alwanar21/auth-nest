import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDTO {
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}
