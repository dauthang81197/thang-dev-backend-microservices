import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserEntity } from '../../shareds/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, ConfigService],
  exports: [],
})
export class AuthModule {
  constructor() {
    console.log(process.env.JWT_SECRET, 'dslkhfs');
  }
}
