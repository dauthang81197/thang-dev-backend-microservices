import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'user.create',
    description: 'Permission name (must be unique)',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Permission to create users',
    description: 'Permission description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
