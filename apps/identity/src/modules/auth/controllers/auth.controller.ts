import { AuthService } from '../auth.service';
import { MessagePattern } from '@nestjs/microservices';
import { MessagePatternEnum } from '@app/common';
import {
  RegisterDto,
  RegisterOrganizationDto,
  LoginDto,
} from '@app/common/dto';
import { Controller } from '@nestjs/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(MessagePatternEnum.IDENTITY_AUTH_REGISTER)
  async register(registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_AUTH_REGISTER_ORGANIZATION)
  async registerOrganization(registerOrganizationDto: RegisterOrganizationDto) {
    return await this.authService.registerOrganization(registerOrganizationDto);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_AUTH_LOGIN)
  async login(loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }
}
