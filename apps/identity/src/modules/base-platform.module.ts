import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';

export const BASE_PLATFORM_IMPORTS = [AuthModule, UserModule, RoleModule];

export const RABBITMQ_IMPORTS = [];

@Module({
  imports: [...BASE_PLATFORM_IMPORTS, ...RABBITMQ_IMPORTS],
  controllers: [],
  providers: [],
})
export class BasePlatformModule {}
