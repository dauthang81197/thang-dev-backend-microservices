import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessagePatternEnum } from '@app/common';
import { UserService } from '../user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(MessagePatternEnum.IDENTITY_USER_GET_PROFILE)
  async getProfile(data: { userId: string }) {
    return await this.userService.getProfile(data.userId);
  }
}

