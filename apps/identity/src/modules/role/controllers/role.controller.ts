import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessagePatternEnum } from '@app/common';
import {
  CreateRoleDto,
  AssignPermissionDto,
} from '@app/common/dto';
import { RoleService } from '../role.service';

@Controller()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_CREATE_ROLE)
  async create(createRoleDto: CreateRoleDto) {
    return await this.roleService.create(createRoleDto);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_GET_ALL_ROLES)
  async findAll() {
    return await this.roleService.findAll();
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_GET_ROLE)
  async findOne(data: { id: string }) {
    return await this.roleService.findOne(data.id);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_UPDATE_ROLE)
  async update(data: { id: string; updateData: any }) {
    return await this.roleService.update(data.id, data.updateData);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_DELETE_ROLE)
  async remove(data: { id: string }) {
    return await this.roleService.remove(data.id);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_ASSIGN_PERMISSION)
  async assignPermission(assignPermissionDto: AssignPermissionDto) {
    return await this.roleService.assignPermission(assignPermissionDto);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_REMOVE_PERMISSION)
  async removePermission(data: { roleId: string; permissionId: string }) {
    return await this.roleService.removePermission(data.roleId, data.permissionId);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_GET_ROLE_PERMISSIONS)
  async getRolePermissions(data: { roleId: string }) {
    return await this.roleService.getRolePermissions(data.roleId);
  }
}

