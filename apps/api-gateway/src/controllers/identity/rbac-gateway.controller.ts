import {
  Controller,
  Post,
  Get,
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
import { AssignRoleDto, CheckPermissionDto } from '@app/common/dto';

@Controller('rbac')
@ApiTags('RBAC')
@ApiBearerAuth()
export class RBACGatewayController {
  constructor(
    @Inject('IDENTITY_SERVICE') private identityClient: ClientProxy,
  ) {}

  @Post('users/:userId/roles')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role assigned to user successfully',
  })
  @ApiBadRequestResponse({
    description: 'Role already assigned to user',
  })
  assignRoleToUser(
    @Param('userId') userId: string,
    @Body() assignRoleDto: Omit<AssignRoleDto, 'userId'>,
  ) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_ASSIGN_ROLE,
      {
        ...assignRoleDto,
        userId,
      },
    );
  }

  @Delete('users/:userId/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role removed from user successfully',
  })
  removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_REMOVE_ROLE,
      {
        userId,
        roleId,
      },
    );
  }

  @Get('users/:userId/roles')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get user roles successfully',
  })
  getUserRoles(@Param('userId') userId: string) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_GET_USER_ROLES,
      {
        userId,
      },
    );
  }

  @Get('users/:userId/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get user permissions successfully',
  })
  getUserPermissions(@Param('userId') userId: string) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_GET_USER_PERMISSIONS,
      {
        userId,
      },
    );
  }

  @Post('check-permission')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Check permission result',
  })
  checkPermission(@Body() checkPermissionDto: CheckPermissionDto) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_CHECK_PERMISSION,
      checkPermissionDto,
    );
  }
}
