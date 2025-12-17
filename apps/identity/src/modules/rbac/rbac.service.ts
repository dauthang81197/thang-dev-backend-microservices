import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { UserRoleRepository } from '../user/repositories/user-role.repository';
import { RoleRepository } from '../role/repositories/role.repository';
import { PermissionRepository } from '../permission/permission.repository';
import { RolePermissionRepository } from '../role/repositories/role-permission.repository';
import { UserEntity, UserRoleEntity, RoleEntity } from '../../shareds/entities';
import { AssignRoleDto, CheckPermissionDto } from '@app/common/dto';

@Injectable()
export class RBACService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  async assignRoleToUser(assignRoleDto: AssignRoleDto) {
    const { userId, roleId } = assignRoleDto;

    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Check if role exists
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Check if role already assigned
    const existingUserRole = await this.userRoleRepository.findOne({
      where: {
        user: { id: userId },
        role: { id: roleId },
      },
      relations: ['user', 'role'],
    });

    if (existingUserRole) {
      return { message: 'Role is already assigned to this user', userRole: existingUserRole };
    }

    // Create new user-role relationship
    const userRole = this.userRoleRepository.create({
      user: { id: userId } as UserEntity,
      role: { id: roleId } as RoleEntity,
    });

    return await this.userRoleRepository.save(userRole);
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    const userRole = await this.userRoleRepository.findOne({
      where: {
        user: { id: userId },
        role: { id: roleId },
      },
      relations: ['user', 'role'],
    });

    if (!userRole) {
      throw new NotFoundException('Role is not assigned to this user');
    }

    await this.userRoleRepository.remove(userRole);
    return { message: 'Role removed from user successfully' };
  }

  async getUserRoles(userId: string) {
    const userRoles = await this.userRoleRepository.find({
      where: { user: { id: userId } },
      relations: ['role'],
    });

    return userRoles.map((ur) => ur.role).filter((role) => role !== null);
  }

  async getUserPermissions(userId: string) {
    const userRoles = await this.userRoleRepository.find({
      where: { user: { id: userId } },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    });

    const permissionsSet = new Set<string>();
    
    for (const userRole of userRoles) {
      if (userRole.role && userRole.role.rolePermissions) {
        for (const rp of userRole.role.rolePermissions) {
          if (rp.permission && rp.permission.name) {
            permissionsSet.add(rp.permission.name);
          }
        }
      }
    }

    return Array.from(permissionsSet);
  }

  async checkPermission(checkPermissionDto: CheckPermissionDto): Promise<boolean> {
    const { userId, permissionName } = checkPermissionDto;

    // Get user permissions
    const userPermissions = await this.getUserPermissions(userId);

    // Check if user has the required permission
    return userPermissions.includes(permissionName);
  }

  async hasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissionNames.some((permission) => userPermissions.includes(permission));
  }

  async hasAllPermissions(userId: string, permissionNames: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissionNames.every((permission) => userPermissions.includes(permission));
  }
}

