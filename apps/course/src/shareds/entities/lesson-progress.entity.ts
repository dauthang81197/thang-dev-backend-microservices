import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Lesson } from './lesson.entity';

@Entity('lesson_progress')
@Unique(['userId', 'lessonId']) // One progress record per user per lesson
@Index(['userId', 'lessonId'])
@Index(['lessonId'])
@Index(['completed'])
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string; // User ID from identity service (NO FK)

  @Column({ type: 'uuid' })
  @Index()
  lessonId: string;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'int', default: 0 })
  watchedDuration: number; // Seconds watched (for video lessons)

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Lesson, (lesson) => lesson.progress, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;
}
