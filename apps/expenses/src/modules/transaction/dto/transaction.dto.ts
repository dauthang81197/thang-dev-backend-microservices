import {
    IsNotEmpty,
    IsString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsUUID,
    IsDateString,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../../../shareds/entities/expenses/transaction.entity';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
    @ApiProperty({ example: 'uuid-of-wallet', description: 'Wallet ID' })
    @IsNotEmpty()
    @IsUUID()
    walletId!: string;

    @ApiProperty({ example: 'uuid-of-category', description: 'Category ID' })
    @IsNotEmpty()
    @IsUUID()
    categoryId!: string;

    @ApiProperty({
        enum: TransactionType,
        example: TransactionType.EXPENSE,
        description: 'Transaction type',
    })
    @IsNotEmpty()
    @IsEnum(TransactionType)
    type!: TransactionType;

    @ApiProperty({ example: 85.5, description: 'Transaction amount' })
    @IsNotEmpty()
    @IsNumber()
    @Min(0.01)
    amount!: number;

    @ApiPropertyOptional({
        example: 'Grocery shopping at Whole Foods',
        description: 'Transaction description',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        example: '2025-01-14T00:00:00.000Z',
        description: 'Transaction date',
    })
    @IsOptional()
    @IsDateString()
    transactionDate?: string;
}

export class UpdateTransactionDto {
    @ApiPropertyOptional({ example: 'uuid-of-wallet' })
    @IsOptional()
    @IsUUID()
    walletId?: string;

    @ApiPropertyOptional({ example: 'uuid-of-category' })
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @ApiPropertyOptional({ enum: TransactionType })
    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType;

    @ApiPropertyOptional({ example: 120.0 })
    @IsOptional()
    @IsNumber()
    @Min(0.01)
    amount?: number;

    @ApiPropertyOptional({ example: 'Updated description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: '2025-01-15T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    transactionDate?: string;
}

export class FilterTransactionDto {
    @ApiPropertyOptional({ enum: TransactionType })
    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType;

    @ApiPropertyOptional({ example: 'uuid-of-category' })
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @ApiPropertyOptional({ example: 'uuid-of-wallet' })
    @IsOptional()
    @IsUUID()
    walletId?: string;

    @ApiPropertyOptional({ example: '2025-01-01' })
    @IsOptional()
    @IsDateString()
    fromDate?: string;

    @ApiPropertyOptional({ example: '2025-01-31' })
    @IsOptional()
    @IsDateString()
    toDate?: string;

    @ApiPropertyOptional({ example: 'grocery' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number;

    @ApiPropertyOptional({ example: 10, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number;
}
