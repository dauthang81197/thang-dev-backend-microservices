import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';

@Entity('sections')
@Index(['courseId', 'orderIndex'])
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'uuid' })
  @Index()
  courseId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Course, (course) => course.sections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToMany(() => Lesson, (lesson) => lesson.section, {
    cascade: true,
  })
  lessons: Lesson[];
}
