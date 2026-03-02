import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { CategoryEntity } from './category.entity';

@Entity('budgets')
@Index('idx_budgets_user_id', ['userId'])
@Index('idx_budgets_month_year', ['month', 'year'])
@Unique('uq_budgets_user_category_month_year', [
  'userId',
  'categoryId',
  'month',
  'year',
])
export class BudgetEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId!: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  amount!: number;

  @Column({ type: 'int' })
  month!: number;

  @Column({ type: 'int' })
  year!: number;

  @ManyToOne(() => CategoryEntity, (category) => category.budgets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category!: CategoryEntity;
}
