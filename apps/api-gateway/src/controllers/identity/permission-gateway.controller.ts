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
import { CreatePermissionDto } from '@app/common/dto';

@Controller('rbac/permissions')
@ApiTags('RBAC - Permissions')
@ApiBearerAuth()
export class PermissionGatewayController {
  constructor(
    @Inject('IDENTITY_SERVICE') private identityClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Permission created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Permission name already exists',
  })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_CREATE_PERMISSION,
      createPermissionDto,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all permissions successfully',
  })
  findAll() {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_GET_ALL_PERMISSIONS,
      {},
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get permission successfully',
  })
  findOne(@Param('id') id: string) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_GET_PERMISSION,
      {
        id,
      },
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission updated successfully',
  })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_UPDATE_PERMISSION,
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
    description: 'Permission deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.identityClient.send(
      MessagePatternEnum.IDENTITY_RBAC_DELETE_PERMISSION,
      {
        id,
      },
    );
  }
}
