import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetEntity } from '../../shareds/entities/expenses/budget.entity';
import { TransactionEntity } from '../../shareds/entities/expenses/transaction.entity';
import { BudgetService } from './budget.service';
import { BudgetController } from './controllers/budget.controller';

@Module({
    imports: [TypeOrmModule.forFeature([BudgetEntity, TransactionEntity])],
    controllers: [BudgetController],
    providers: [BudgetService],
    exports: [BudgetService],
})
export class BudgetModule { }
