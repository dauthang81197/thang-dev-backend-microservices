import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

export const BASE_PLATFORM_IMPORTS = [AuthModule];

export const RABBITMQ_IMPORTS = [];

@Module({
  imports: [...BASE_PLATFORM_IMPORTS, ...RABBITMQ_IMPORTS],
  controllers: [],
  providers: [],
})
export class BasePlatformModule {}
