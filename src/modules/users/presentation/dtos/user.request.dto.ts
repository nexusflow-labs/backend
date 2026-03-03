import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  IsEmail,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'user must not be empty' })
  @IsString({ message: 'user name must be a string' })
  @MinLength(3, {
    message: 'user name must be at least 3 characters long',
  })
  @MaxLength(50, { message: 'user name must not exceed 50 characters' })
  readonly name: string;

  @IsNotEmpty({ message: 'user must not be empty' })
  @IsString({ message: 'user name must be a string' })
  @IsEmail({ allow_display_name: false }, { message: 'Invalid email format' })
  readonly email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  readonly password: string;

  @IsOptional()
  @IsString({ message: 'avatar must be a string' })
  readonly avatar?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;
}
