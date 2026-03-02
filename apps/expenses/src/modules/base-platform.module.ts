import { Module } from '@nestjs/common';
import { WalletModule } from './wallet/wallet.module';
import { CategoryModule } from './category/category.module';
import { TransactionModule } from './transaction/transaction.module';
import { BudgetModule } from './budget/budget.module';
import { DashboardModule } from './dashboard/dashboard.module';

export const BASE_PLATFORM_IMPORTS = [
  WalletModule,
  CategoryModule,
  TransactionModule,
  BudgetModule,
  DashboardModule,
];

@Module({
  imports: [...BASE_PLATFORM_IMPORTS],
  controllers: [],
  providers: [],
})
export class BasePlatformModule {}
