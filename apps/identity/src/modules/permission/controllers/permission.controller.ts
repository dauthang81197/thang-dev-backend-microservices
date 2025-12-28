import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessagePatternEnum } from '@app/common';
import { CreatePermissionDto } from '@app/common/dto';
import { PermissionService } from '../permission.service';

@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_CREATE_PERMISSION)
  async create(createPermissionDto: CreatePermissionDto) {
    return await this.permissionService.create(createPermissionDto);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_GET_ALL_PERMISSIONS)
  async findAll() {
    return await this.permissionService.findAll();
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_GET_PERMISSION)
  async findOne(data: { id: string }) {
    return await this.permissionService.findOne(data.id);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_UPDATE_PERMISSION)
  async update(data: { id: string; updateData: any }) {
    return await this.permissionService.update(data.id, data.updateData);
  }

  @MessagePattern(MessagePatternEnum.IDENTITY_RBAC_DELETE_PERMISSION)
  async remove(data: { id: string }) {
    return await this.permissionService.remove(data.id);
  }
}
