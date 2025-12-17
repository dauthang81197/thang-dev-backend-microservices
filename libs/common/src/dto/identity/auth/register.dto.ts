import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'thangdau811@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'thangdau811',
  })
  username: string;

  @ApiProperty({
    example: 'Admin@123',
  })
  password: string;
}
