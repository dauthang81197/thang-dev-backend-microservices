import { Module } from '@nestjs/common';
import { WalletModule } from './wallet/wallet.module';
import { CategoryModule } from './category/category.module';
import { TransactionModule } from './transaction/transaction.module';
import { BudgetModule } from './budget/budget.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TaskModule } from './task/task.module';
import { TagModule } from './tag/tag.module';
import { TaskSettingsModule } from './task-settings/task-settings.module';

export const BASE_PLATFORM_IMPORTS = [
  WalletModule,
  CategoryModule,
  TransactionModule,
  BudgetModule,
  DashboardModule,
  TaskModule,
  TagModule,
  TaskSettingsModule,
];

@Module({
  imports: [...BASE_PLATFORM_IMPORTS],
  controllers: [],
  providers: [],
})
export class BasePlatformModule {}
