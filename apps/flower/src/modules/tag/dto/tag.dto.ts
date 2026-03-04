import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'Work', description: 'Tag name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiPropertyOptional({ example: '#4A5568', description: 'Hex color code' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}

export class UpdateTagDto {
  @ApiPropertyOptional({ example: 'Personal' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: '#48BB78' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}
