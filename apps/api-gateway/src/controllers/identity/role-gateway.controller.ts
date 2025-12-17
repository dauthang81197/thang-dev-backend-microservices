import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MessagePatternEnum } from '@app/common';
import { CreateRoleDto, AssignPermissionDto } from '@app/common/dto';

@Controller('rbac/roles')
@ApiTags('RBAC - Roles')
@ApiBearerAuth()
export class RoleGatewayController {
  constructor(
    @Inject('IDENTITY_SERVICE') private identityClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Role name already exists',
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_CREATE_ROLE,
      createRoleDto,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all roles successfully',
  })
  findAll() {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_GET_ALL_ROLES,
      {},
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get role successfully',
  })
  findOne(@Param('id') id: string) {
    return this.identityClient.send(MessagePatternEnum.IDENTITY_RBAC_GET_ROLE, {
      id,
    });
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role updated successfully',
  })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_UPDATE_ROLE,
      {
        id,
        updateData,
      },
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_DELETE_ROLE,
      {
        id,
      },
    );
  }

  @Post(':roleId/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission assigned to role successfully',
  })
  assignPermission(
    @Param('roleId') roleId: string,
    @Body() assignPermissionDto: Omit<AssignPermissionDto, 'roleId'>,
  ) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_ASSIGN_PERMISSION,
      {
        ...assignPermissionDto,
        roleId,
      },
    );
  }

  @Delete(':roleId/permissions/:permissionId')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission removed from role successfully',
  })
  removePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_REMOVE_PERMISSION,
      {
        roleId,
        permissionId,
      },
    );
  }

  @Get(':roleId/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get role permissions successfully',
  })
  getRolePermissions(@Param('roleId') roleId: string) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_GET_ROLE_PERMISSIONS,
      {
        roleId,
      },
    );
  }
}
