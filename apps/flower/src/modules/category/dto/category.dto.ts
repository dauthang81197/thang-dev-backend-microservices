import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '../../../shareds/entities/flower/category.entity';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Food & Dining', description: 'Category name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    enum: CategoryType,
    example: CategoryType.EXPENSE,
    description: 'Category type',
  })
  @IsNotEmpty()
  @IsEnum(CategoryType)
  type!: CategoryType;

  @ApiPropertyOptional({
    example: '🍔',
    description: 'Icon emoji or identifier',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ example: '#FF6384', description: 'Hex color code' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Groceries' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: CategoryType })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiPropertyOptional({ example: '🛒' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ example: '#36A2EB' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}

export class FilterCategoryDto {
  @ApiPropertyOptional({ enum: CategoryType })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}
