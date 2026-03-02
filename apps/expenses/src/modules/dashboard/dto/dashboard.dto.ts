import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DashboardQueryDto {
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
