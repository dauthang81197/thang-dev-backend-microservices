import {
  Controller,
  Get,
  Inject,
  HttpStatus,
  HttpCode,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MessagePatternEnum } from '@app/common';
import { UserDto } from '@app/common/dto';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserGatewayController {
  constructor(
    @Inject('IDENTITY_SERVICE') private identityClient: ClientProxy,
  ) {}

  @Get('/profile')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get user profile successfully',
    type: UserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  getProfile(@Request() req: any) {
    // Extract user ID from JWT token (should be set by auth guard/middleware)
    const userId = req.user?.sub || req.user?.id;

    if (!userId) {
      throw new Error('User ID not found in request');
    }

    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_USER_GET_PROFILE,
      {
        userId,
      },
    );
  }
}
