import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity, TransactionType } from '../../shareds/entities/expenses/transaction.entity';
import { WalletEntity, WalletType } from '../../shareds/entities/expenses/wallet.entity';

@Injectable()
export class DashboardService {
    private readonly logger = new Logger(DashboardService.name);

    constructor(
        @InjectRepository(TransactionEntity)
        private readonly transactionRepository: Repository<TransactionEntity>,
        @InjectRepository(WalletEntity)
        private readonly walletRepository: Repository<WalletEntity>,
    ) { }

    async getOverview(userId: string, month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        // 1. Total Balance (sum of all wallet balances)
        const wallets = await this.walletRepository.find({ where: { userId } });
        let totalBalance = 0;
        for (const w of wallets) {
            totalBalance += Number(w.balance);
        }

        // 2. Total Income & Expense for the month
        const incomeExpense = await this.transactionRepository
            .createQueryBuilder('t')
            .select('t.type', 'type')
            .addSelect('COALESCE(SUM(t.amount), 0)', 'total')
            .where('t.userId = :userId', { userId })
            .andWhere('t.transactionDate >= :startDate', { startDate })
            .andWhere('t.transactionDate <= :endDate', { endDate })
            .groupBy('t.type')
            .getRawMany();

        let totalIncome = 0;
        let totalExpense = 0;
        for (const row of incomeExpense) {
            if (row.type === TransactionType.INCOME) {
                totalIncome = Number(row.total);
            } else if (row.type === TransactionType.EXPENSE) {
                totalExpense = Number(row.total);
            }
        }

        // 3. Previous month totals (for comparison)
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        const prevStartDate = new Date(prevYear, prevMonth - 1, 1);
        const prevEndDate = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

        const prevIncomeExpense = await this.transactionRepository
            .createQueryBuilder('t')
            .select('t.type', 'type')
            .addSelect('COALESCE(SUM(t.amount), 0)', 'total')
            .where('t.userId = :userId', { userId })
            .andWhere('t.transactionDate >= :startDate', { startDate: prevStartDate })
            .andWhere('t.transactionDate <= :endDate', { endDate: prevEndDate })
            .groupBy('t.type')
            .getRawMany();

        let prevIncome = 0;
        let prevExpense = 0;
        for (const row of prevIncomeExpense) {
            if (row.type === TransactionType.INCOME) {
                prevIncome = Number(row.total);
            } else if (row.type === TransactionType.EXPENSE) {
                prevExpense = Number(row.total);
            }
        }

        // 4. Income vs Expenses last 6 months
        const incomeVsExpenseLast6Months = await this.getIncomeVsExpenseLast6Months(
            userId,
            month,
            year,
        );

        // 5. Expense by Category (current month)
        const expenseByCategory = await this.transactionRepository
            .createQueryBuilder('t')
            .leftJoin('t.category', 'c')
            .select('c.id', 'categoryId')
            .addSelect('c.name', 'categoryName')
            .addSelect('c.icon', 'categoryIcon')
            .addSelect('c.color', 'categoryColor')
            .addSelect('COALESCE(SUM(t.amount), 0)', 'total')
            .where('t.userId = :userId', { userId })
            .andWhere('t.type = :type', { type: TransactionType.EXPENSE })
            .andWhere('t.transactionDate >= :startDate', { startDate })
            .andWhere('t.transactionDate <= :endDate', { endDate })
            .groupBy('c.id')
            .addGroupBy('c.name')
            .addGroupBy('c.icon')
            .addGroupBy('c.color')
            .orderBy('total', 'DESC')
            .getRawMany();

        // Calculate expense percentages
        const expenseByCategoryWithPercent = expenseByCategory.map((item) => ({
            ...item,
            total: Number(item.total),
            percentage:
                totalExpense > 0
                    ? Number(((Number(item.total) / totalExpense) * 100).toFixed(1))
                    : 0,
        }));

        // 6. Top 5 Categories
        const topCategories = expenseByCategoryWithPercent.slice(0, 5);

        // 7. Recent 5 transactions
        const recentTransactions = await this.transactionRepository.find({
            where: { userId },
            relations: ['wallet', 'category'],
            order: { transactionDate: 'DESC', createdAt: 'DESC' },
            take: 5,
        });

        // Calculate percentage changes
        const incomeChange =
            prevIncome > 0
                ? Number((((totalIncome - prevIncome) / prevIncome) * 100).toFixed(1))
                : 0;

        const expenseChange =
            prevExpense > 0
                ? Number(
                    (((totalExpense - prevExpense) / prevExpense) * 100).toFixed(1),
                )
                : 0;

        const netSavings = totalIncome - totalExpense;
        const prevNetSavings = prevIncome - prevExpense;
        const savingsChange =
            prevNetSavings > 0
                ? Number(
                    (
                        ((netSavings - prevNetSavings) / Math.abs(prevNetSavings)) *
                        100
                    ).toFixed(1),
                )
                : 0;

        return {
            totalBalance: Number(totalBalance.toFixed(2)),
            totalIncome: Number(totalIncome.toFixed(2)),
            totalExpense: Number(totalExpense.toFixed(2)),
            netSavings: Number(netSavings.toFixed(2)),
            incomeChangePercent: incomeChange,
            expenseChangePercent: expenseChange,
            savingsChangePercent: savingsChange,
            incomeVsExpenseLast6Months,
            expenseByCategory: expenseByCategoryWithPercent,
            topCategories,
            recentTransactions,
        };
    }

    private async getIncomeVsExpenseLast6Months(
        userId: string,
        currentMonth: number,
        currentYear: number,
    ) {
        const months: { month: number; year: number; label: string }[] = [];
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];

        for (let i = 5; i >= 0; i--) {
            let m = currentMonth - i;
            let y = currentYear;
            if (m <= 0) {
                m += 12;
                y -= 1;
            }
            months.push({ month: m, year: y, label: monthNames[m - 1] });
        }

        const result: { month: string; year: number; income: number; expense: number }[] = [];

        for (const { month, year, label } of months) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);

            const data = await this.transactionRepository
                .createQueryBuilder('t')
                .select('t.type', 'type')
                .addSelect('COALESCE(SUM(t.amount), 0)', 'total')
                .where('t.userId = :userId', { userId })
                .andWhere('t.transactionDate >= :startDate', { startDate })
                .andWhere('t.transactionDate <= :endDate', { endDate })
                .groupBy('t.type')
                .getRawMany();

            let income = 0;
            let expense = 0;
            for (const row of data) {
                if (row.type === TransactionType.INCOME) {
                    income = Number(row.total);
                } else {
                    expense = Number(row.total);
                }
            }

            result.push({ month: label, year, income, expense });
        }

        return result;
    }
}
