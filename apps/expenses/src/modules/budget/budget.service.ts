import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BudgetEntity } from '../../shareds/entities/expenses/budget.entity';
import { TransactionEntity, TransactionType } from '../../shareds/entities/expenses/transaction.entity';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class BudgetService {
    private readonly logger = new Logger(BudgetService.name);

    constructor(
        @InjectRepository(BudgetEntity)
        private readonly budgetRepository: Repository<BudgetEntity>,
        @InjectRepository(TransactionEntity)
        private readonly transactionRepository: Repository<TransactionEntity>,
    ) { }

    async create(userId: string, dto: CreateBudgetDto): Promise<BudgetEntity> {
        // Check if budget already exists for this user/category/month/year
        const existing = await this.budgetRepository.findOne({
            where: {
                userId,
                categoryId: dto.categoryId,
                month: dto.month,
                year: dto.year,
            },
        });

        if (existing) {
            throw new RpcException({
                statusCode: 409,
                message: 'Budget already exists for this category/month/year',
            });
        }

        const budget = this.budgetRepository.create({
            userId,
            categoryId: dto.categoryId,
            amount: dto.amount,
            month: dto.month,
            year: dto.year,
        });

        return this.budgetRepository.save(budget);
    }

    async findByMonthYear(userId: string, month: number, year: number) {
        // Get all budgets for the month/year
        const budgets = await this.budgetRepository.find({
            where: { userId, month, year },
            relations: ['category'],
            order: { createdAt: 'DESC' },
        });

        // Calculate spent amounts using QueryBuilder
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const spentAmounts = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('transaction.category_id', 'categoryId')
            .addSelect('COALESCE(SUM(transaction.amount), 0)', 'spent')
            .where('transaction.userId = :userId', { userId })
            .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
            .andWhere('transaction.transactionDate >= :startDate', { startDate })
            .andWhere('transaction.transactionDate <= :endDate', { endDate })
            .andWhere('transaction.categoryId IN (:...categoryIds)', {
                categoryIds: budgets.length > 0
                    ? budgets.map((b) => b.categoryId)
                    : ['00000000-0000-0000-0000-000000000000'],
            })
            .groupBy('transaction.category_id')
            .getRawMany();

        const spentMap = new Map(
            spentAmounts.map((s) => [s.categoryId, Number(s.spent)]),
        );

        const result = budgets.map((budget) => {
            const spentAmount = spentMap.get(budget.categoryId) || 0;
            const budgetAmount = Number(budget.amount);
            const remaining = budgetAmount - spentAmount;
            const percentageUsed =
                budgetAmount > 0
                    ? Number(((spentAmount / budgetAmount) * 100).toFixed(1))
                    : 0;

            return {
                id: budget.id,
                category: budget.category,
                budgetAmount,
                spentAmount: Number(spentAmount.toFixed(2)),
                remaining: Number(remaining.toFixed(2)),
                percentageUsed,
                month: budget.month,
                year: budget.year,
            };
        });

        // Calculate totals
        const totalBudget = result.reduce((sum, b) => sum + b.budgetAmount, 0);
        const totalSpent = result.reduce((sum, b) => sum + b.spentAmount, 0);

        return {
            overview: {
                totalBudget: Number(totalBudget.toFixed(2)),
                totalSpent: Number(totalSpent.toFixed(2)),
                remaining: Number((totalBudget - totalSpent).toFixed(2)),
                percentageUsed:
                    totalBudget > 0
                        ? Number(((totalSpent / totalBudget) * 100).toFixed(1))
                        : 0,
                activeBudgets: budgets.length,
            },
            budgets: result,
        };
    }

    async update(
        id: string,
        userId: string,
        dto: UpdateBudgetDto,
    ): Promise<BudgetEntity> {
        const budget = await this.budgetRepository.findOne({
            where: { id, userId },
        });
        if (!budget) {
            throw new RpcException({
                statusCode: 404,
                message: 'Budget not found',
            });
        }
        Object.assign(budget, dto);
        return this.budgetRepository.save(budget);
    }

    async delete(id: string, userId: string): Promise<{ message: string }> {
        const budget = await this.budgetRepository.findOne({
            where: { id, userId },
        });
        if (!budget) {
            throw new RpcException({
                statusCode: 404,
                message: 'Budget not found',
            });
        }
        await this.budgetRepository.remove(budget);
        return { message: 'Budget deleted successfully' };
    }
}
