import { Module } from '@nestjs/common';
import { RBACService } from './rbac.service';
import { RBACController } from './controllers/rbac.controller';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [UserModule, RoleModule, PermissionModule],
  controllers: [RBACController],
  providers: [RBACService],
  exports: [RBACService],
})
export class RBACModule {}
