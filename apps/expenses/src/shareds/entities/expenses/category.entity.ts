import {
    Entity,
    Column,
    OneToMany,
    Index,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TransactionEntity } from './transaction.entity';
import { BudgetEntity } from './budget.entity';

export enum CategoryType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
}

@Entity('categories')
@Index('idx_categories_user_id', ['userId'])
@Index('idx_categories_type', ['type'])
export class CategoryEntity extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({
        type: 'enum',
        enum: CategoryType,
    })
    type!: CategoryType;

    @Column({ type: 'varchar', length: 50, nullable: true })
    icon!: string;

    @Column({ type: 'varchar', length: 7, nullable: true })
    color!: string;

    @OneToMany(() => TransactionEntity, (transaction) => transaction.category)
    transactions!: TransactionEntity[];

    @OneToMany(() => BudgetEntity, (budget) => budget.category)
    budgets!: BudgetEntity[];
}
