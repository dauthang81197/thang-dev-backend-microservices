import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity, RolePermissionEntity } from '../../shareds/entities';
import { RoleService } from './role.service';
import { RoleRepository } from './repositories/role.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { RoleController } from './controllers/role.controller';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, RolePermissionEntity]),
    PermissionModule,
  ],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, RolePermissionRepository],
  exports: [RoleService, RoleRepository, RolePermissionRepository],
})
export class RoleModule {}
