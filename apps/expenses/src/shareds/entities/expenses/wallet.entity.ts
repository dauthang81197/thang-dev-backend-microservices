import {
    Entity,
    Column,
    OneToMany,
    Index,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TransactionEntity } from './transaction.entity';

export enum WalletType {
    CASH = 'CASH',
    BANK = 'BANK',
    CREDIT = 'CREDIT',
    E_WALLET = 'E_WALLET',
    INVESTMENT = 'INVESTMENT',
}

@Entity('wallets')
@Index('idx_wallets_user_id', ['userId'])
export class WalletEntity extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    @Index('idx_wallets_user_id_name', ['userId', 'name'])
    userId!: string;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({
        type: 'enum',
        enum: WalletType,
        default: WalletType.CASH,
    })
    type!: WalletType;

    @Column({
        type: 'decimal',
        precision: 15,
        scale: 2,
        default: 0,
    })
    balance!: number;

    @OneToMany(() => TransactionEntity, (transaction) => transaction.wallet)
    transactions!: TransactionEntity[];
}
