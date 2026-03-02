import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';

@Entity('transcripts')
export class Transcript {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  @Index()
  lessonId: string;

  @Column({ type: 'text' })
  content: string; // Full transcript text

  @Column({ type: 'jsonb', nullable: true })
  segments: any[]; // Timestamped segments: [{ start: 0, end: 5, text: "..." }, ...]

  @Column({ type: 'varchar', length: 10, default: 'vi' })
  language: string; // Language code (vi, en, etc.)

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string; // Transcription source (whisper, google, etc.)

  @Column({ type: 'int', nullable: true })
  duration: number; // Video duration in seconds

  @Column({ type: 'int', nullable: true })
  wordCount: number; // Total words in transcript

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;
}
