import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessagePatternEnum } from '@app/common';
import { AssignRoleDto, CheckPermissionDto } from '@app/common/dto';
import { RBACService } from '../rbac.service';

@Controller()
export class RBACController {
  constructor(private readonly rbacService: RBACService) {}

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_ASSIGN_ROLE)
  async assignRoleToUser(assignRoleDto: AssignRoleDto) {
    return await this.rbacService.assignRoleToUser(assignRoleDto);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_REMOVE_ROLE)
  async removeRoleFromUser(data: { userId: string; roleId: string }) {
    return await this.rbacService.removeRoleFromUser(data.userId, data.roleId);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_GET_USER_ROLES)
  async getUserRoles(data: { userId: string }) {
    return await this.rbacService.getUserRoles(data.userId);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_GET_USER_PERMISSIONS)
  async getUserPermissions(data: { userId: string }) {
    return await this.rbacService.getUserPermissions(data.userId);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_CHECK_PERMISSION)
  async checkPermission(checkPermissionDto: CheckPermissionDto) {
    const hasPermission = await this.rbacService.checkPermission(checkPermissionDto);
    return { hasPermission };
  }
}

