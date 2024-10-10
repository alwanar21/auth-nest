import { IsDateString, IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty({ message: 'Username must not be empty' })
  @IsString({ message: 'Username must be a string' })
  @Matches(/^(?![_.])[a-zA-Z0-9._]{3,10}(?<![_.])$/, {
    message:
      'Username must be 3-10 characters, can contain uppercase or lowercase letters, numbers, periods, and underscores, and cannot start, end, or have consecutive periods or underscores.',
  })
  username: string;

  @IsNotEmpty({ message: 'Birth date is required' })
  @IsDateString({}, { message: 'Birth Date must be a valid Date' })
  birthDate: Date;
}
