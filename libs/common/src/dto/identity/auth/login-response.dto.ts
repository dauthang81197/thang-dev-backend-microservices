import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.res.dto';

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: UserDto;
}
