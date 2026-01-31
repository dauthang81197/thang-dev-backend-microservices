import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserEntity } from '../../shareds/entities';
import { UserModule } from '../user/user.module';
import { OrganizationModule } from '../organization/organization.module';
import { ENVIRONMENT } from '../../env/environment';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: () => {
        const secret = process.env.JWT_SECRET || 'thang2026';
        console.log('[Auth Module] JWT_SECRET:', secret ? `${secret.substring(0, 5)}***` : 'UNDEFINED');
        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
    HttpModule,
    UserModule,
    OrganizationModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, ConfigService],
  exports: [AuthService],
})
export class AuthModule { }
