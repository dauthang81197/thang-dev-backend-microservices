import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { WalletEntity } from './wallet.entity';
import { CategoryEntity } from './category.entity';

export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
}

@Entity('transactions')
@Index('idx_transactions_user_id', ['userId'])
@Index('idx_transactions_transaction_date', ['transactionDate'])
@Index('idx_transactions_category_id', ['categoryId'])
@Index('idx_transactions_wallet_id', ['walletId'])
@Index('idx_transactions_type', ['type'])
@Index('idx_transactions_user_date', ['userId', 'transactionDate'])
export class TransactionEntity extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @Column({ name: 'wallet_id', type: 'uuid' })
    walletId!: string;

    @Column({ name: 'category_id', type: 'uuid' })
    categoryId!: string;

    @Column({
        type: 'enum',
        enum: TransactionType,
    })
    type!: TransactionType;

    @Column({
        type: 'decimal',
        precision: 15,
        scale: 2,
    })
    amount!: number;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column({
        name: 'transaction_date',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    transactionDate!: Date;

    @ManyToOne(() => WalletEntity, (wallet) => wallet.transactions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'wallet_id' })
    wallet!: WalletEntity;

    @ManyToOne(() => CategoryEntity, (category) => category.transactions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'category_id' })
    category!: CategoryEntity;
}
