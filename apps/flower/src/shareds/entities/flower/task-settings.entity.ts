import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TaskPriority } from './task.entity';

export enum DefaultView {
  LIST = 'LIST',
  BOARD = 'BOARD',
  CALENDAR = 'CALENDAR',
}

@Entity('task_settings')
@Index('idx_task_settings_user_id', ['userId'], { unique: true })
export class TaskSettingsEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @Column({
    name: 'default_view',
    type: 'enum',
    enum: DefaultView,
    default: DefaultView.LIST,
  })
  defaultView!: DefaultView;

  @Column({
    name: 'show_completed',
    type: 'boolean',
    default: true,
  })
  showCompleted!: boolean;

  @Column({
    name: 'default_priority',
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  defaultPriority!: TaskPriority;

  @Column({
    name: 'auto_archive_days',
    type: 'int',
    default: 30,
  })
  autoArchiveDays!: number;
}
