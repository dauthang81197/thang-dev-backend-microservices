import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { IMulterOptionsForRegisterUser } from 'src/common/utils';
import { LogExecutionTime } from 'src/decorators/log-execution-time.decorator';
import { RefreshTokenGuard } from 'src/guards';
import { AuthService } from 'src/modules/auth/auth.service';
import { CheckOraganizationDto } from 'src/modules/auth/dto/check-oraganization.dto';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';

import { ForgetPasswordDto } from '../dto/forget-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyTokenDto } from '../dto/verify-token.dto';

@Controller('auth')
@ApiTags('auth')
@ApiBearerAuth()
@LogExecutionTime()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login user successfully',
  })
  @ApiBadRequestResponse({
    description: 'Username or password incorrect',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/check-organization')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Register user successfully',
  })
  @ApiBadRequestResponse({
    description: 'Email is already in use',
  })
  checkOrganizaion(@Body() registerDto: CheckOraganizationDto) {
    return this.authService.checkOrganization(registerDto);
  }

  @Post('/register')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Register user successfully',
  })
  @ApiBadRequestResponse({
    description: 'Email is already in use',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 5, IMulterOptionsForRegisterUser))
  async register(
    @Body() registerDto: RegisterDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @I18n() i18n: I18nContext,
  ) {
    return await this.authService.register(registerDto, files, i18n);
  }

  @Get('/forget-password')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Forget password successfully',
  })
  async forgetPassword(
    @Query() query: ForgetPasswordDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.authService.forgetPassword(query, i18n);
  }

  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reset password successfully',
  })
  @ApiBadRequestResponse({
    description: 'User does not exist',
  })
  resetPassword(
    @Body() resetPassword: ResetPasswordDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.authService.resetPassword(resetPassword, i18n);
  }

  @Get('/verify-token-expiry')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Forget password successfully',
  })
  async verifyTokenExpiry(
    @Query() query: VerifyTokenDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.authService.verifyTokenExpiry(query, i18n);
  }

  // Refresh Token
  @Get('/refresh-token')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(@Req() request) {
    return await this.authService.refreshToken(request);
  }

  // Login with google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    return req;
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(
    @Req() req,
    @Res({ passthrough: true }) res,
    @I18n() i18n: I18nContext,
  ) {
    return this.authService.googleRedirect(req, res, i18n);
  }

  // Login with azure
  @Get('azure/login')
  @UseGuards(AuthGuard('azure-ad'))
  async azureAuth(@Req() req) {
    if (req) {
      return req;
    } else {
      return 'Sign in not found';
    }
  }

  @Post('azure/callback')
  async callbackAzure(@Req() req, @Res() res, @I18n() i18n: I18nContext) {
    return await this.authService.azureRedirect(req, res, i18n);
  }
}
