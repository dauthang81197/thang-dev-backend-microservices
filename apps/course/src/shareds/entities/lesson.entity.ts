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
import { Section } from './section.entity';
import { LessonProgress } from './lesson-progress.entity';

export enum LessonType {
  VIDEO = 'video',
  ARTICLE = 'article',
  QUIZ = 'quiz',
  CODING_EXERCISE = 'coding_exercise',
  RESOURCE = 'resource',
}

@Entity('lessons')
@Index(['sectionId', 'orderIndex'])
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: LessonType,
    default: LessonType.VIDEO,
  })
  type: LessonType;

  @Column({ type: 'text', nullable: true })
  content: string; // Video URL, article content, quiz JSON, etc.

  @Column({ type: 'int', default: 0 })
  duration: number; // Duration in seconds

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'boolean', default: false })
  isFree: boolean; // Allow preview for non-enrolled users

  @Column({ type: 'uuid' })
  @Index()
  sectionId: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[]; // URLs to downloadable resources

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Section, (section) => section.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sectionId' })
  section: Section;

  @OneToMany(() => LessonProgress, (progress) => progress.lesson)
  progress: LessonProgress[];
}
