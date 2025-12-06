import {
  Controller,
  Post,
  Body,
  Inject,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MessagePatternEnum } from '@app/common';
import { RegisterDto } from '@app/common/dto';

@Controller('auth')
@ApiTags('auth')
@ApiBearerAuth()
export class AuthGatewayController {
  constructor(@Inject('IDENTITY_SERVICE') private usersClient: ClientProxy) {}

  @Post('/register')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Register user successfully',
  })
  @ApiBadRequestResponse({
    description: 'Email is already in use',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.usersClient.send(
      MessagePatternEnum.IDENTITY_AUTH_REGISTER,
      registerDto,
    );
  }
}
