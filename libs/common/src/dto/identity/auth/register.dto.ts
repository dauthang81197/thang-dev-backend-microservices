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

  @ApiProperty({
    example: '92be80b9-4f5c-4ed9-94fb-68844c15cff3',
  })
  organizationId: string;
}
