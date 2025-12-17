import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity, RolePermissionEntity } from '../../shareds/entities';
import { RoleService } from './role.service';
import { RoleRepository } from './repositories/role.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, RolePermissionEntity])],
  providers: [RoleService, RoleRepository, RolePermissionRepository],
  exports: [RoleService, RoleRepository, RolePermissionRepository],
})
export class RoleModule {}
