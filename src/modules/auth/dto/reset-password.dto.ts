import { IsNotEmpty, IsString, Matches, ValidateIf } from 'class-validator';
import { IsMatch } from 'src/common/decorators/match.decorator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Token is Required' })
  @IsString({ message: 'Token must be a string' })
  token: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Matches(/^(?=.*[A-Z])(?=.*\W).{7,}$/, {
    message:
      'Password must contain at least one uppercase letter, one special character, and be at least 7 characters long',
  })
  password: string;

  @IsNotEmpty({ message: 'Confirm Password is required' })
  @IsString({ message: 'Confirm Password must be a string' })
  @ValidateIf((o) => o.password)
  @IsMatch('password')
  confirmPassword: string;
}
