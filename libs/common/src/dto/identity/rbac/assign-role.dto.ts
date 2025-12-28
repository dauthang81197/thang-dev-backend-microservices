import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    example: 'user-uuid-here',
    description: 'User ID',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'role-uuid-here',
    description: 'Role ID',
  })
  @IsNotEmpty()
  @IsUUID()
  roleId: string;
}
