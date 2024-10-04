import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginUserDTO {
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  @MaxLength(100, { message: 'Passwordcannot be longer than 100 characters' })
  password: string;
}
