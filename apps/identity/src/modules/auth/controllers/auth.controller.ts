import { AuthService } from '../auth.service';
import { MessagePattern } from '@nestjs/microservices';
import { MessagePatternEnum } from '@app/common';
import { RegisterDto } from '@app/common/dto';
import { Controller } from '@nestjs/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(MessagePatternEnum.IDENTITY_AUTH_REGISTER)
  async register(registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }
}
