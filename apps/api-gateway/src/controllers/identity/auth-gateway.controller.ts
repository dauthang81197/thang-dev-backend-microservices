import {
  Controller,
  Post,
  Get,
  Body,
  Inject,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
  Res,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
  UserDto,
} from '@app/common/dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { GoogleAuthGuard } from '../../guards/google-auth.guard';
import type { Response } from 'express';
import { ENVIRONMENT } from '../../../env/environment';

@Controller('auth')
@ApiTags('auth')
export class AuthGatewayController {
  private readonly logger = new Logger(AuthGatewayController.name);

  constructor(@Inject('IDENTITY_SERVICE') private usersClient: ClientProxy) { }

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
  async login(@Body() loginDto: LoginDto) {
    console.log('[Auth Gateway] Login request received:', { email: loginDto.email });

    const result = await this.usersClient.send(
      MessagePatternEnum.IDENTITY_AUTH_LOGIN,
      loginDto,
    ).toPromise();

    console.log('[Auth Gateway] Login response:', result ? 'SUCCESS' : 'FAILED');
    return result;
  }

  // ==================== Google OAuth ====================

  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirect to Google OAuth consent screen',
  })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth() {
    // Guard redirects to Google automatically
  }

  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Google OAuth callback - redirects to frontend with JWT token',
  })
  async googleAuthCallback(@Request() req: any, @Res() res: Response) {
    this.logger.log('[Auth Gateway] Google callback received');

    try {
      const googleUser = req.user;

      if (!googleUser) {
        this.logger.error('[Auth Gateway] No user data from Google');
        const frontendUrl = ENVIRONMENT.frontend.url;
        return res.redirect(
          `${frontendUrl}/auth/login?error=google_auth_failed`,
        );
      }

      this.logger.log(`[Auth Gateway] Google user: ${googleUser.email}`);

      // Send Google profile to Identity service to find/create user and generate JWT
      const result = await this.usersClient
        .send(MessagePatternEnum.IDENTITY_AUTH_GOOGLE_LOGIN, {
          googleId: googleUser.googleId,
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          fullName: googleUser.fullName,
          avatar: googleUser.avatar,
        })
        .toPromise();

      this.logger.log('[Auth Gateway] Google login response: SUCCESS');

      // Redirect to frontend with token
      const frontendUrl = ENVIRONMENT.frontend.url;
      return res.redirect(
        `${frontendUrl}/auth/google/callback?token=${result.accessToken}`,
      );
    } catch (error) {
      this.logger.error('[Auth Gateway] Google login failed:', error);
      const frontendUrl = ENVIRONMENT.frontend.url;
      return res.redirect(
        `${frontendUrl}/auth/login?error=google_auth_failed`,
      );
    }
  }

  // ==================== End Google OAuth ====================

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get current user successfully',
    type: UserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or expired token',
  })
  getCurrentUser(@Request() req: any) {
    const userId = req.user?.id;
    console.log(req.user, "àdslkjf");
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    return this.usersClient.send(MessagePatternEnum.IDENTITY_AUTH_GET_ME, {
      userId,
    });
  }
}
