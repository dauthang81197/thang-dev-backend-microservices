import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletType } from '../../../shareds/entities/expenses/wallet.entity';

export class CreateWalletDto {
  @ApiProperty({ example: 'Chase Bank', description: 'Wallet name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    enum: WalletType,
    example: WalletType.BANK,
    description: 'Wallet type',
  })
  @IsNotEmpty()
  @IsEnum(WalletType)
  type!: WalletType;

  @ApiPropertyOptional({
    example: 15420.75,
    description: 'Initial balance',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  balance?: number;
}

export class UpdateWalletDto {
  @ApiPropertyOptional({ example: 'Chase Savings' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: WalletType })
  @IsOptional()
  @IsEnum(WalletType)
  type?: WalletType;
}

export class WalletSummaryResponseDto {
  @ApiProperty({ example: 62561.0 })
  totalAssets!: number;

  @ApiProperty({ example: 2340.5 })
  totalLiabilities!: number;

  @ApiProperty({ example: 60220.5 })
  netWorth!: number;
}
