import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Section } from './section.entity';
import { LessonProgress } from './lesson-progress.entity';
import { Transcript } from './transcript.entity';

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

  // Tree structure fields for hierarchical lessons
  @Column({ type: 'uuid', nullable: true })
  @Index()
  parentId: string | null; // Parent lesson ID for nested structure

  @Column({ type: 'varchar', length: 500, nullable: true })
  path: string | null; // Materialized path (e.g., "uuid1.uuid2.uuid3")

  @Column({ type: 'int', default: 0 })
  level: number; // Depth level in the tree (0 = root)

  @Column({ type: 'int', default: 0 })
  childrenCount: number; // Number of direct children (denormalized)

  // R2 video storage fields
  @Column({ type: 'varchar', length: 500, nullable: true })
  videoKey: string; // R2 object key for video file

  @Column({ type: 'bigint', nullable: true })
  videoSize: number; // Video file size in bytes

  @Column({ type: 'varchar', length: 50, nullable: true })
  videoFormat: string; // Video format (mp4, webm, etc.)

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

  @ManyToOne(() => Lesson, (lesson) => lesson.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Lesson;

  @OneToMany(() => Lesson, (lesson) => lesson.parent)
  children: Lesson[];

  @OneToMany(() => LessonProgress, (progress) => progress.lesson)
  progress: LessonProgress[];

  @OneToOne(() => Transcript, (transcript) => transcript.lesson)
  transcript: Transcript;
}
