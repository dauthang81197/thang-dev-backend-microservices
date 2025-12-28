import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignPermissionDto {
  @ApiProperty({
    example: 'role-uuid-here',
    description: 'Role ID',
  })
  @IsNotEmpty()
  @IsUUID()
  roleId: string;

  @ApiProperty({
    example: 'permission-uuid-here',
    description: 'Permission ID',
  })
  @IsNotEmpty()
  @IsUUID()
  permissionId: string;
}
