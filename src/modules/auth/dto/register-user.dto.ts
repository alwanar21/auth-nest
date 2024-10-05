import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { IsMatch } from 'src/common/decorators/match.decorator';

export class RegisterUserDTO {
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  @IsString({ message: 'Password must be a string' })
  @Matches(/^(?=.*[A-Z])(?=.*\W).{7,}$/, {
    message:
      'Password must contain at least one uppercase letter, one special character, and be at least 7 characters long',
  })
  password: string;

  @IsNotEmpty({ message: 'Confirm Password must not be empty' })
  @IsString({ message: 'Confirm Password must be a string' })
  @ValidateIf((o) => o.password)
  @IsMatch('password')
  confirmPassword: string;
}
