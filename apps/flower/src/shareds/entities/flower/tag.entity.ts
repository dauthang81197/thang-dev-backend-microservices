import { Entity, Column, ManyToMany, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TaskEntity } from './task.entity';

@Entity('tags')
@Index('idx_tags_user_id', ['userId'])
@Index('idx_tags_user_name', ['userId', 'name'], { unique: true })
export class TagEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color!: string;

  @ManyToMany(() => TaskEntity, (task) => task.tags)
  tasks!: TaskEntity[];
}
