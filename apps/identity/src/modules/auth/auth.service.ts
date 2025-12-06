import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import * as jwt from 'jsonwebtoken';
import { I18nContext } from 'nestjs-i18n';
import { catchError, firstValueFrom } from 'rxjs';
import { AreaEnum, StatusEnum, TypeSsoEnum, UserGroupEnum } from 'src/common';
import {
  comparePassword,
  getUrlFrontEndEndPoint,
  getUrlFrontEndPath,
  randomString,
} from 'src/common/utils';
import { MyBadRequestException } from 'src/exceptions/bad-request.exception';
import { ConfigCookie } from 'src/interfaces';
import { CheckOraganizationDto } from 'src/modules/auth/dto/check-oraganization.dto';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { MailService } from 'src/modules/mail/mail.service';
import {
  FileUploadResponse,
  UploadsService,
} from 'src/modules/uploads/uploads.service';
import { UserEntity } from 'src/modules/users/user.entity';
import { UsersRepository } from 'src/modules/users/users.repository';
import { EntityManager } from 'typeorm';

import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserDto } from './dto/user.res.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { PatternCode } from '../rabbitmq-producer/rabbitmq-producer.enum';
import { RabbitmqProducerService } from '../rabbitmq-producer/rabbitmq-producer.service';
import { getKeyFindByEmail } from '../redis/cache.const';
import { RedisService } from '../redis/redis.service';
import { ResetPasswordService } from '../reset-password/reset-password.service';
import { ReviewFileEntity } from '../review-files/entities/review-file.entity';
import { ReviewPipelineEntity } from '../review-pipelines/entities/review-pipeline.entity';
import { ReviewPipelinesService } from '../review-pipelines/review-pipelines.service';
import { SystemConfigKey } from '../system-config/enums/system-config.enum';
import { SystemConfigService } from '../system-config/services/system-config.admin.service';
import { UserProfileResponseDto } from '../users/dto/user-profile.response.dto';
import { UsersService } from '../users/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UsersRepository,
    private configService: ConfigService,
    private readonly mailService: MailService,
    private readonly httpService: HttpService,
    private readonly uploadsService: UploadsService,
    private readonly userService: UsersService,
    private manager: EntityManager,
    private readonly reviewPipelinesService: ReviewPipelinesService,
    private readonly resetPasswordService: ResetPasswordService,
    private readonly rabbitmqService: RabbitmqProducerService,
    private systemConfigSer: SystemConfigService,
    private readonly redisService: RedisService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async login(
    loginDto: LoginDto,
    userGroupAccepted: UserGroupEnum = UserGroupEnum.ORGANIZATION,
  ) {
    const { email, password, rememberMe } = loginDto;
    const userExisted = await this.userService.checkEmailBelongToOrg(email);
    const orgType = userExisted?.organization?.organizationType?.code;
    let isCheckCaptcha = false;
    if (userGroupAccepted !== orgType) {
      throw new ForbiddenException('sso.ACCESS_DENIED');
    }

    if (userExisted.loginFailedCount === 4) {
      if (loginDto.tokenRecaptcha) {
        isCheckCaptcha = await this.isRecaptchaSucessfully(
          loginDto.tokenRecaptcha,
        );
        if (!isCheckCaptcha) {
          throw new MyBadRequestException(
            '',
            'users.RECAPTCHA_TOKEN_IS_INVALID',
            {
              isRequiredCaptcha: true,
            },
          );
        }
      } else {
        throw new MyBadRequestException(
          '',
          'users.RECAPTCHA_TOKEN_IS_REQUIRED',
          {
            isRequiredCaptcha: true,
          },
        );
      }
    }
    if (!comparePassword(password, userExisted.password)) {
      if (userExisted.loginFailedCount < 4) {
        await this.userService.loginFailedCount(email);
      }
      if (userExisted.loginFailedCount === 4) {
        throw new MyBadRequestException(
          '',
          'users.RECAPTCHA_TOKEN_IS_REQUIRED',
          {
            isRequiredCaptcha: true,
          },
        );
      }

      throw new UnauthorizedException('auth.USERNAME_OR_PASS_INCORRECT_LOGIN');
    }
    if (isCheckCaptcha) {
      await this.userService.resetLoginFailedCount(userExisted);
    }

    const payload = await this.payloadToken(userExisted, rememberMe);
    // update refresh token
    await this.userRepository.update(userExisted.id, {
      refreshToken: payload.refreshToken,
    });
    await this.userService.updateLastLoginTime(userExisted.id, new Date());
    return {
      token: payload?.token,
      refreshToken: payload?.refreshToken,
      user: UserProfileResponseDto.fromUser(userExisted),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      statusCode: HttpStatus.OK,
    };
  }

  async register(
    registerDto: RegisterDto,
    files: Array<Express.Multer.File>,
    i18n: I18nContext,
  ) {
    this.logger.log('Function register start !!!');
    const { email, organizationName, name } = registerDto;
    if (!files || (files && files.length === 0)) {
      throw new BadRequestException('file.FILE_IS_REQUIRED');
    }

    try {
      return await this.manager.transaction(
        async (transactionalEntityManager) => {
          const userExisted = await this.userRepository.findByEmail(email);
          if (userExisted) {
            throw new BadRequestException('users.EMAIL_IS_EXISTED');
          }
          const reviewPipelineWithStatusIsReviewFind =
            await this.reviewPipelinesService.findByMailRequest(email);

          if (reviewPipelineWithStatusIsReviewFind) {
            throw new BadRequestException(
              'signUpRequest.REQUEST_WITH_UNDER_REVIEW',
            );
          }
          const listFileReview = [];
          await this._saveFile(
            files,
            transactionalEntityManager,
            listFileReview,
          );
          // save review pipelines
          const reviewPipelinesSaved = await transactionalEntityManager
            .getRepository(ReviewPipelineEntity)
            .save({
              organizationName,
              accountEmail: email,
              accountName: name,
              reviewFiles:
                files && files.length > 0 ? listFileReview : undefined,
              status: StatusEnum.UNDER_REVIEW,
            });

          await this.mailService.awaitingEmail(
            reviewPipelinesSaved?.accountEmail,
            reviewPipelinesSaved?.code,
            reviewPipelinesSaved?.accountName,
            reviewPipelinesSaved?.organizationName,
          );

          // Rabbit mq
          this.rabbitmqService.send(PatternCode.REGISTRATION, {
            data: { reviewPipelinesId: reviewPipelinesSaved.id },
          });

          return {
            message: i18n.t('users.RESITER_SUCCESS'),
            statusCode: HttpStatus.OK,
          };
        },
      );
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  async checkOrganization(registerDto: CheckOraganizationDto) {
    this.logger.log('Function checkOrganization start !!!');
    const { email } = registerDto;

    const userExisted =
      await this.userRepository.findByEmailWithOrganzation(email);
    if (userExisted) {
      const organization = userExisted.organization;
      if (organization?.name) {
        throw new BadRequestException('users.EMAIL_HAVE_BEEN_REGISTERED');
      }
      throw new BadRequestException('users.EMAIL_HAS_ALREADY_BEEN_USED');
    }
  }

  async validateUser(email: string): Promise<UserEntity> {
    this.logger.log('Function validateUser start !!!');
    const userCache = (await this.redisService.get(
      getKeyFindByEmail(email),
    )) as UserEntity;

    if (userCache) {
      return userCache;
    }
    const user = await this.userRepository.findByEmail(email);
    await this.redisService.set(
      getKeyFindByEmail(email),
      user,
      60 * 60 * 24 * 1000,
    );
    if (!user) {
      throw new BadRequestException('users.USER_NOT_EXIST');
    }
    return user;
  }

  // google
  async googleRedirect(
    req,
    res,
    i18n: I18nContext,
    userGroupAccepted: UserGroupEnum = UserGroupEnum.ORGANIZATION,
  ) {
    this.logger.log('Function googleRedirect start !!!');
    if (!req.user) {
      this.logger.log('No user from google');
      return 'No user from google';
    }
    let fullName;
    if (req?.user?.firstName && req?.user?.lastName) {
      fullName = req?.user?.firstName + ' ' + req?.user?.lastName;
    }

    // check validate sso
    return await this.validateSso(
      req.user.email,
      res,
      i18n,
      userGroupAccepted,
      fullName,
    );
  }

  // azure

  async azureRedirect(
    req,
    res,
    i18n: I18nContext,
    userGroupAccepted: UserGroupEnum = UserGroupEnum.ORGANIZATION,
  ) {
    this.logger.log('Function azureRedirect start !!!');
    const validated = jwt.decode(req.body.id_token) as {
      email: string;
      name: string;
    };

    // check validate sso
    return await this.validateSso(
      validated?.email,
      res,
      i18n,
      userGroupAccepted,
      validated?.name,
    );
  }

  async forgetPassword(
    forgetPasswordDto: ForgetPasswordDto,
    i18n: I18nContext,
    userGroupAccepted: UserGroupEnum = UserGroupEnum.ORGANIZATION,
  ) {
    this.logger.log('Function forgetPassword start !!!');
    const userFind = await this.userService.checkEmailToOrgForgotpassword(
      forgetPasswordDto.email,
    );

    const org = userFind?.organization;
    const orgType = org?.organizationType?.code;
    if (userGroupAccepted !== orgType) {
      throw new ForbiddenException('sso.ACCESS_DENIED');
    }

    const resetCode = randomString(6);
    const resetPasswordFind = await this.resetPasswordService.findByEmail(
      forgetPasswordDto.email,
    );
    if (resetPasswordFind) {
      await this.resetPasswordService.update({
        ...resetPasswordFind,
        resetCode,
      });
    } else {
      await this.resetPasswordService.update({
        email: forgetPasswordDto.email,
        status: 1,
        resetCode,
      });
    }

    const token = jwt.sign(
      {
        data: { email: userFind.email, resetCode: resetCode },
      },
      this.configService.get('JWT_SECRET'),
      {
        expiresIn: '30m',
      },
    );

    const url = `${this.configService.get(
      'BASE_URL_FRONTEND',
    )}${getUrlFrontEndEndPoint(userGroupAccepted)}/forget-password/${token}/${
      userFind.uuid
    }`;

    try {
      // Send mail
      await this.mailService.resetPasswordRequest(
        forgetPasswordDto.email,
        org.id,
        url,
        userFind?.fullName,
      );
    } catch (ex) {
      this.logger.error(ex);
    }

    return {
      statusCode: HttpStatus.OK,
      message: i18n.t('users.FORGET_PASSWORD_PASSWORD_SUCCESSFULLY'),
      data: userFind,
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    i18n: I18nContext,
    userGroupAccepted: UserGroupEnum = UserGroupEnum.ORGANIZATION,
  ) {
    this.logger.log('Function resetPassword start !!!');
    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmNewPassword) {
      throw new BadRequestException(
        'users.PASSWORD_CONFIRMATION_DOES_NOT_MATCH',
      );
    }
    const { email, resetCode } = await this.mailService.decodeConfirmationToken(
      resetPasswordDto.token,
    );
    if (!email) {
      throw new BadRequestException('users.EMAIL_IS_NOT_EXISTED');
    }
    const userFind = await this.userService.findByEmailAndUserId(
      email,
      resetPasswordDto.userId,
    );
    if (!userFind) {
      throw new BadRequestException('users.EMAIL_IS_NOT_EXISTED');
    }

    const orgType = userFind?.organization?.organizationType?.code;
    if (userGroupAccepted !== orgType) {
      throw new ForbiddenException('sso.ACCESS_DENIED');
    }

    const resetPasswordFind =
      await this.resetPasswordService.findByEmail(email);
    if (!resetPasswordFind) {
      throw new BadRequestException('users.EMAIL_IS_NOT_EXISTED');
    }

    if (!resetPasswordFind?.resetCode) {
      throw new BadRequestException('users.TOKEN_EXPIRE');
    }

    if (resetPasswordFind?.resetCode !== resetCode) {
      throw new BadRequestException('users.VERIFY_CODE_IS_INCORRECT');
    }

    if (comparePassword(resetPasswordDto.newPassword, userFind.password)) {
      throw new BadRequestException(
        'auth.THE_NEW_PASSWORD_IS_THE_SAME_AS_OLD_PASSWORD',
      );
    }

    const verifyToken = await this.verifyTokenExpiry(
      { token: resetPasswordDto.token },
      i18n,
    );

    if (verifyToken.isTokensExpire) {
      throw new BadRequestException('users.TOKEN_EXPIRE');
    }

    userFind.password = resetPasswordDto.newPassword;
    try {
      await this.userRepository.save(userFind);
      await this.mailService.updatePasswordSuccessfully(
        email,
        userFind.fullName,
      );
      await this.resetPasswordService.update({
        ...resetPasswordFind,
        resetCode: null,
      });
    } catch (error) {
      this.logger.error(error);
    }

    return {
      statusCode: HttpStatus.OK,
      message: i18n.t('users.RESET_PASSWORD_SUCCESS'),
      data: { id: userFind?.id, email: userFind?.email },
    };
  }

  async verifyTokenExpiry(query: VerifyTokenDto, i18n: I18nContext) {
    try {
      const validated = jwt.verify(
        query.token,
        this.configService.get('JWT_SECRET'),
      );
      if (validated) {
        if (
          typeof validated === 'object' &&
          validated?.data?.email &&
          validated?.data?.resetCode
        ) {
          const resetPasswordFind = await this.resetPasswordService.findByEmail(
            validated?.data?.email,
          );
          if (resetPasswordFind.resetCode === validated?.data?.resetCode) {
            return {
              status: HttpStatus.OK,
              message: i18n.t('users.TOKEN_DO_NOT_EXPIRE'),
              isTokensExpire: false,
            };
          } else {
            this.logger.error('TOKEN_EXPIRE');
            throw new MyBadRequestException('', 'users.TOKEN_EXPIRE', {
              isTokensExpire: true,
            });
          }
        } else {
          this.logger.error('TOKEN_EXPIRE');
          throw new MyBadRequestException('', 'users.TOKEN_EXPIRE', {
            isTokensExpire: true,
          });
        }
      }
    } catch (error) {
      this.logger.error(error);
      throw new MyBadRequestException('', 'users.TOKEN_EXPIRE', {
        isTokensExpire: true,
      });
    }
  }

  async refreshToken(req: any) {
    const userFind = await this.userService.checkEmailBelongToOrg(
      req.user?.['email'],
    );

    if (!bcrypt.compare(req.user?.['refreshToken'], userFind.refreshToken)) {
      throw new ForbiddenException('auth.ACCESS_DENIED');
    }
    const payload = await this.payloadToken(userFind);

    // update refresh token
    await this.userRepository.save({
      id: userFind.id,
      refreshToken: payload.refreshToken,
    });
    return {
      token: payload.token,
      refreshToken: payload.refreshToken,
      user: {
        id: userFind?.id,
        fullName: userFind?.fullName,
        email: userFind?.email,
        phoneNumber: userFind?.phoneNumber,
        orgId: userFind?.organization?.id,
        orgName: userFind?.organization?.name,
        role: userFind?.roles?.[0]?.name,
        roleCode: userFind?.roles?.[0]?.code,
        orgTypeCode: userFind?.organization?.organizationType?.code,
        orgCode: userFind?.organization?.code,
        createdDate: userFind?.createdAt,
        updateAt: userFind?.updatedAt,
        updatedPasswordDate: userFind?.updatedPasswordAt,
      },
    };
  }

  private async isRecaptchaSucessfully(token: string): Promise<boolean> {
    try {
      if (!token) {
        throw new BadRequestException('users.RECAPTCHA_TOKEN_IS_REQUIRED');
      }
      const secretKey = this.configService.get('GOOGLE_SECRET_CAPTCHA');
      const { data } = await firstValueFrom(
        this.httpService
          .post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
          )
          .pipe(
            catchError(() => {
              throw new BadRequestException();
            }),
          ),
      );

      return !!data.success;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  private async renderTokenAndSuccessResponse(
    userFind: UserEntity,
    res: any,
    area: string,
    configCookie: ConfigCookie,
    redirect: string,
  ) {
    const userDto: UserDto = plainToInstance(UserDto, userFind, {
      excludeExtraneousValues: true,
    });
    const token = jwt.sign(
      {
        data: userDto,
      },
      this.configService.get('JWT_SECRET'),
      {
        expiresIn: this.configService.get('JWT_TOKEN_EXPIRE'),
      },
    );
    this.logger.log(token, TypeSsoEnum.LOGIN_SUCESSFULLY, area, userFind);

    return res
      .status(HttpStatus.OK)
      .cookie('type', TypeSsoEnum.LOGIN_SUCESSFULLY, configCookie)
      .cookie('token', token, configCookie)
      .cookie('area', area, configCookie)
      .cookie('user', userFind, configCookie)
      .redirect(redirect);
  }

  private async validateSso(
    email: string,
    res: any,
    i18n: I18nContext,
    userGroupAccepted: UserGroupEnum,
    fullName?: string,
  ) {
    const redirect = `${this.configService.get(
      'BASE_URL_FRONTEND',
    )}${getUrlFrontEndEndPoint(userGroupAccepted)}/${this.configService.get(
      'REDIRECT_REFRESHED_FONTEND',
    )}`;
    const area = AreaEnum.SHP;

    const configCookie = {
      path: getUrlFrontEndPath(userGroupAccepted),
      domain: this.configService.get('COOKIE_DOMAIN'),
      httpOnly: false,
      secure: false,
    };

    const userFind = await this.userRepository.findByEmailSSO(email);

    const orgType = userFind?.organization?.organizationType?.code;

    if (!userFind || (userFind && !userFind.organization)) {
      this.logger.log(email, area, TypeSsoEnum.REGISTER, redirect);
      return res
        .status(HttpStatus.OK)
        .cookie('email', email, configCookie)
        .cookie('area', area, configCookie)
        .cookie(
          'type',
          userGroupAccepted === UserGroupEnum.SYSTEM
            ? TypeSsoEnum.ACCESS_DENIED
            : TypeSsoEnum.REGISTER,
          configCookie,
        )
        .cookie('message', i18n.t('sso.CANNOT_FIND_YOUR_ACCOUNT'), configCookie)
        .cookie('fullName', fullName, configCookie)
        .redirect(redirect);
    }

    if (orgType && userGroupAccepted !== orgType) {
      this.logger.log(area, TypeSsoEnum.UNDER_REVIEW, redirect);
      return res
        .status(HttpStatus.OK)
        .cookie('type', TypeSsoEnum.ACCESS_DENIED, configCookie)
        .cookie('area', area, configCookie)
        .cookie('message', i18n.t('sso.ACCESS_DENIED'), configCookie)
        .redirect(redirect);
    }

    if (
      userFind.organization &&
      userFind.organization.status !== StatusEnum.ACTIVE
    ) {
      this.logger.log(area, TypeSsoEnum.UNDER_REVIEW, redirect);
      return res
        .status(HttpStatus.OK)
        .cookie('type', TypeSsoEnum.UNDER_REVIEW, configCookie)
        .cookie('area', area, configCookie)
        .cookie(
          'message',
          i18n.t('users.EMAIL_NOT_INVITE_BY_ADMIN'),
          configCookie,
        )
        .redirect(redirect);
    }

    if (userFind.status !== StatusEnum.ACTIVE) {
      this.logger.log(area, TypeSsoEnum.UNDER_REVIEW, redirect);
      return res
        .status(HttpStatus.OK)
        .cookie('type', TypeSsoEnum.UNDER_REVIEW, configCookie)
        .cookie('area', area, configCookie)
        .cookie('message', i18n.t('users.EMAIL_NOT_FOUND_IN_ORG'), configCookie)
        .redirect(redirect);
    }

    //return if all conditions passed
    return this.renderTokenAndSuccessResponse(
      userFind,
      res,
      area,
      configCookie,
      redirect,
    );
  }

  private async _saveFile(
    files: Express.Multer.File[],
    transactionalEntityManager: EntityManager,
    listFileReview: ({
      uuid: string;
      name: string;
      path: string;
      description: string;
    } & ReviewFileEntity)[],
  ) {
    if (files && files.length > 0) {
      // save file s3
      const filesSavedS3: FileUploadResponse[] =
        await this.uploadsService.uploadPublicFiles(files);

      //  save review file
      const configValue = await this.systemConfigSer.getByKey(
        SystemConfigKey.AWS_CLOUD_FRONT_DOMAIN,
      );
      for (const file of filesSavedS3) {
        const reviewFileCreated = await transactionalEntityManager
          .getRepository(ReviewFileEntity)
          .save({
            uuid: file.uuid,
            name: file.fileName,
            path: file.Key,
            domainUrl: configValue as string,
            description: '',
          });
        listFileReview.push(reviewFileCreated);
      }
    }
  }

  private async payloadToken(userExisted: UserEntity, rememberMe?: boolean) {
    const token = jwt.sign(
      {
        data: UserProfileResponseDto.fromUser(userExisted),
      },
      this.configService.get('JWT_SECRET'),
      {
        expiresIn: rememberMe
          ? this.configService.get('JWT_TOKEN_REFRESH_EXPIRE_REMEMBER_ME')
          : this.configService.get('JWT_TOKEN_EXPIRE'),
      },
    );

    const refreshToken = jwt.sign(
      {
        data: UserProfileResponseDto.fromUser(userExisted),
      },
      this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      {
        expiresIn: this.configService.get('JWT_TOKEN_REFRESH_EXPIRE'),
      },
    );

    return { token, refreshToken };
  }
}
