import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CheckOraganizationDto {
  @ApiProperty()
  @IsEmail({}, { message: 'users.EMAIL_IS_INVALID' })
  email: string;
}
