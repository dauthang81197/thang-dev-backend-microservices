import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../shareds/entities/expenses/transaction.entity';
import { WalletEntity } from '../../shareds/entities/expenses/wallet.entity';
import { TransactionService } from './transaction.service';
import { TransactionController } from './controllers/transaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity, WalletEntity])],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
