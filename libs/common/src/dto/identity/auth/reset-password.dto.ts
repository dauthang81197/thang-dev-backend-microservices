import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
} from 'class-validator';
import { IsNotBlank } from '../../../decorators';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsNotBlank('userId')
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNotBlank('token')
  @IsString()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNotBlank('newPassword')
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message: 'users.PASSWORD_IS_INVALID',
    },
  )
  @MaxLength(20, {
    message: 'users.PASSWORD_MAXLENGTH_INVALID',
  })
  @Matches(/^[^\s]+$/, { message: 'Whitespace is not allowed' })
  newPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNotBlank('confirmNewPassword')
  confirmNewPassword: string;
}
