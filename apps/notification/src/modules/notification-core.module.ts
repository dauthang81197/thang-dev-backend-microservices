import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../../flower/src/shareds/entities/flower/transaction.entity';
import { TelegramService } from './telegram/telegram.service';
import { DailySpendingJobService } from './jobs/daily-spending.job';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([TransactionEntity]),
  ],
  providers: [TelegramService, DailySpendingJobService],
  exports: [TelegramService],
})
export class NotificationCoreModule {}
