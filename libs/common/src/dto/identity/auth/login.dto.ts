import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'users.EMAIL_IS_REQUIRED',
  })
  @IsEmail({}, { message: 'users.EMAIL_IS_INVALID' })
  email: string;

  @ApiProperty()
  @IsString({
    message: 'users.PASSWORD_IS_REQUIRED',
  })
  @IsNotEmpty({
    message: 'users.PASSWORD_IS_REQUIRED',
  })
  password: string;

  @ApiPropertyOptional()
  tokenRecaptcha: string;

  @ApiProperty({ type: Boolean, required: false })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  rememberMe: boolean;
}
