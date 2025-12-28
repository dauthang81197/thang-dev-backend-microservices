import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CheckPermissionDto {
  @ApiProperty({
    example: 'user-uuid-here',
    description: 'User ID',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'user.create',
    description: 'Permission name to check',
  })
  @IsNotEmpty()
  @IsString()
  permissionName: string;
}
