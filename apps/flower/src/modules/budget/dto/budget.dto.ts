import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBudgetDto {
  @ApiProperty({ example: 'uuid-of-category', description: 'Category ID' })
  @IsNotEmpty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: 500.0, description: 'Budget amount' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({
    example: 500.0,
    description: 'Budget amount (alias for amount)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  budgetAmount?: number;

  @ApiProperty({ example: 1, description: 'Month (1-12)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiProperty({ example: 2025, description: 'Year' })
  @IsNotEmpty()
  @IsNumber()
  @Min(2000)
  year!: number;
}

export class UpdateBudgetDto {
  @ApiPropertyOptional({ example: 600.0, description: 'New budget amount' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}

export class FilterBudgetDto {
  @ApiProperty({ example: 1, description: 'Month (1-12)' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiProperty({ example: 2025, description: 'Year' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(2000)
  year!: number;
}
