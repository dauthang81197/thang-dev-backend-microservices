import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/modules/mail/mail.module';
import { RoleModule } from 'src/modules/role/role.module';
import { UploadsModule } from 'src/modules/uploads/uploads.module';
import { UserEntity } from 'src/modules/users/user.entity';
import { UsersModule } from 'src/modules/users/users.module';
import { UsersRepository } from 'src/modules/users/users.repository';

import { AuthService } from './auth.service';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AuthController } from './controllers/auth.controller';
import {
  RefreshTokenStrategy,
  LocalStrategy,
  JwtStragegy,
  GoogleStrategy,
  AzureAdStrategy,
  AdminGoogleStrategy,
  AdminAzureAdStrategy,
} from '../../strategy';
import { OrganizationModule } from '../organization/organization.module';
import { RedisModule } from '../redis/redis.module';
import { ResetPasswordModule } from '../reset-password/reset-password.module';
import { ReviewFilesModule } from '../review-files/review-files.module';
import { ReviewPipelinesModule } from '../review-pipelines/review-pipelines.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { SystemConfigRepository } from '../system-config/repositories/system-config.repository';
import { SystemConfigService } from '../system-config/services/system-config.admin.service';
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([UserEntity]),
    RoleModule,
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_TOKEN_EXPIRE },
    }),
    HttpModule,
    OrganizationModule,
    ReviewPipelinesModule,
    ReviewFilesModule,
    UploadsModule,
    ResetPasswordModule,
    SubscriptionModule,
    RedisModule,
  ],
  controllers: [AuthController, AdminAuthController],
  providers: [
    UsersRepository,
    AuthService,
    ConfigService,
    GoogleStrategy,
    AzureAdStrategy,
    AdminGoogleStrategy,
    AdminAzureAdStrategy,
    LocalStrategy,
    JwtStragegy,
    RefreshTokenStrategy,
    SystemConfigService,
    SystemConfigRepository,
  ],
  exports: [],
})
export class AuthModule {}
