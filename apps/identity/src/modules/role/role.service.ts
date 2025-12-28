import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleRepository } from './repositories/role.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { RoleEntity, PermissionEntity } from '../../shareds/entities';
import { CreateRoleDto, AssignPermissionDto } from '@app/common/dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new BadRequestException(
        `Role with name "${createRoleDto.name}" already exists`,
      );
    }

    return await this.roleRepository.save(createRoleDto);
  }

  async findAll() {
    return await this.roleRepository.find({
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    return role;
  }

  async findByName(name: string) {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    if (!role) {
      throw new NotFoundException(`Role with name "${name}" not found`);
    }

    return role;
  }

  async update(id: string, updateData: Partial<RoleEntity>) {
    const role = await this.findOne(id);
    return await this.roleRepository.save({
      ...role,
      ...updateData,
    });
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    await this.roleRepository.softDelete(id);
    return role;
  }

  async assignPermission(assignPermissionDto: AssignPermissionDto) {
    const { roleId, permissionId } = assignPermissionDto;

    // Check if role exists
    await this.findOne(roleId);

    // Check if permission already assigned
    const existingRolePermission = await this.rolePermissionRepository.findOne({
      where: {
        role: { id: roleId },
        permission: { id: permissionId },
      },
      relations: ['role', 'permission'],
    });

    if (existingRolePermission) {
      throw new BadRequestException(
        'Permission is already assigned to this role',
      );
    }

    // Create new role-permission relationship
    const rolePermission = this.rolePermissionRepository.create({
      role: { id: roleId } as RoleEntity,
      permission: { id: permissionId } as PermissionEntity,
    });

    return await this.rolePermissionRepository.save(rolePermission);
  }

  async removePermission(roleId: string, permissionId: string) {
    const rolePermission = await this.rolePermissionRepository.findOne({
      where: {
        role: { id: roleId },
        permission: { id: permissionId },
      },
      relations: ['role', 'permission'],
    });

    if (!rolePermission) {
      throw new NotFoundException('Permission is not assigned to this role');
    }

    await this.rolePermissionRepository.remove(rolePermission);
    return { message: 'Permission removed from role successfully' };
  }

  async getRolePermissions(roleId: string) {
    const role = await this.findOne(roleId);
    return role.rolePermissions.map((rp) => rp.permission);
  }
}
