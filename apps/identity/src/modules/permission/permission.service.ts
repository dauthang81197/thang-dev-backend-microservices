import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PermissionRepository } from './permission.repository';
import { PermissionEntity } from '../../shareds/entities';
import { CreatePermissionDto } from '@app/common/dto';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const existingPermission = await this.permissionRepository.findOne({
      where: { name: createPermissionDto.name },
    });

    if (existingPermission) {
      throw new BadRequestException(
        `Permission with name "${createPermissionDto.name}" already exists`,
      );
    }

    return await this.permissionRepository.save(createPermissionDto);
  }

  async findAll() {
    return await this.permissionRepository.find();
  }

  async findOne(id: string) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }

    return permission;
  }

  async findByName(name: string) {
    const permission = await this.permissionRepository.findOne({
      where: { name },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with name "${name}" not found`);
    }

    return permission;
  }

  async update(id: string, updateData: Partial<PermissionEntity>) {
    const permission = await this.findOne(id);
    return await this.permissionRepository.save({
      ...permission,
      ...updateData,
    });
  }

  async remove(id: string) {
    const permission = await this.findOne(id);
    await this.permissionRepository.softDelete(id);
    return permission;
  }
}
