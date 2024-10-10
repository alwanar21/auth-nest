import { IsNotEmpty, IsString, Matches, ValidateIf } from 'class-validator';
import { IsMatch } from 'src/common/decorators/match.decorator';

export class UpdatePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString({ message: 'Current Password must be a string' })
  currentPassword: string;

  @IsNotEmpty({ message: 'New Password is required' })
  @IsString({ message: 'New Password must be a string' })
  @Matches(/^(?=.*[A-Z])(?=.*\W).{7,}$/, {
    message:
      'New Password must contain at least one uppercase letter, one special character, and be at least 7 characters long',
  })
  newPassword: string;

  @IsNotEmpty({ message: 'Confirm Password is required' })
  @IsString({ message: 'Confirm Password must be a string' })
  @ValidateIf((o) => o.newPassword)
  @IsMatch('newPassword')
  confirmPassword: string;
}
