import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../shareds/entities/expenses/transaction.entity';
import { WalletEntity } from '../../shareds/entities/expenses/wallet.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './controllers/dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity, WalletEntity])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
