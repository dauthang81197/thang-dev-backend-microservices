import { Entity, Column, ManyToMany, JoinTable, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TagEntity } from './tag.entity';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  OVERDUE = 'OVERDUE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('tasks')
@Index('idx_tasks_user_id', ['userId'])
@Index('idx_tasks_status', ['status'])
@Index('idx_tasks_priority', ['priority'])
@Index('idx_tasks_due_date', ['dueDate'])
@Index('idx_tasks_user_status', ['userId', 'status'])
@Index('idx_tasks_user_due_date', ['userId', 'dueDate'])
export class TaskEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column({
    name: 'due_date',
    type: 'timestamp',
    nullable: true,
  })
  dueDate!: Date;

  @Column({
    name: 'estimated_minutes',
    type: 'int',
    nullable: true,
  })
  estimatedMinutes!: number;

  @ManyToMany(() => TagEntity, (tag) => tag.tasks, { eager: true })
  @JoinTable({
    name: 'task_tags',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: TagEntity[];
}
