import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsEmail({}, { message: 'users.EMAIL_IS_INVALID' })
  email: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  organizationName: string;
}
