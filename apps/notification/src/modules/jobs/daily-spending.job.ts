import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TransactionEntity,
  TransactionType,
} from '../../../../flower/src/shareds/entities/flower/transaction.entity';
import { TelegramService } from '../telegram/telegram.service';

const DAILY_SPENDING_THRESHOLD = 4.6;

@Injectable()
export class DailySpendingJobService {
  private readonly logger = new Logger(DailySpendingJobService.name);

  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * Run every hour to check if total spending today has exceeded $4.6
   * and send a Telegram notification.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkDailySpendingAlert(): Promise<void> {
    this.logger.log('Running daily spending alert job...');

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999,
    );

    const results = await this.transactionRepository
      .createQueryBuilder('t')
      .select('t.userId', 'userId')
      .addSelect('COALESCE(SUM(t.amount), 0)', 'totalSpending')
      .where('t.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('t.transactionDate >= :startOfDay', { startOfDay })
      .andWhere('t.transactionDate <= :endOfDay', { endOfDay })
      .groupBy('t.userId')
      .getRawMany();

    for (const row of results) {
      const totalSpending = Number(row.totalSpending);

      if (totalSpending > DAILY_SPENDING_THRESHOLD) {
        const dateStr = today.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

        const message =
          `⚠️ <b>Cảnh báo chi tiêu hôm nay!</b>\n\n` +
          `📅 Ngày: <b>${dateStr}</b>\n` +
          `💸 Tổng chi tiêu: <b>$${totalSpending.toFixed(2)}</b>\n` +
          `🚨 Vượt ngưỡng: <b>$${DAILY_SPENDING_THRESHOLD}</b>\n\n` +
          `Hãy kiểm soát chi tiêu của bạn nhé! 💪`;

        this.logger.warn(
          `User ${row.userId} exceeded daily spending threshold: $${totalSpending.toFixed(2)}`,
        );

        await this.telegramService.sendMessage(message);
      }
    }

    this.logger.log('Daily spending alert job completed.');
  }
}
