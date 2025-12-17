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
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MessagePatternEnum } from '@app/common';
import {
  RegisterDto,
  RegisterOrganizationDto,
  LoginDto,
  LoginResponseDto,
} from '@app/common/dto';

@Controller('auth')
@ApiTags('auth')
export class AuthGatewayController {
  constructor(@Inject('IDENTITY_SERVICE') private usersClient: ClientProxy) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
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

  @Post('/register/organization')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Register organization successfully',
  })
  @ApiBadRequestResponse({
    description: 'Organization code already exists',
  })
  registerOrganization(
    @Body() registerOrganizationDto: RegisterOrganizationDto,
  ) {
    return this.usersClient.send(
      MessagePatternEnum.IDENTITY_AUTH_REGISTER_ORGANIZATION,
      registerOrganizationDto,
    );
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successfully',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
  })
  login(@Body() loginDto: LoginDto) {
    return this.usersClient.send(
      MessagePatternEnum.IDENTITY_AUTH_LOGIN,
      loginDto,
    );
  }
}
