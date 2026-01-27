import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Section } from './section.entity';
import { Enrollment } from './enrollment.entity';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL_LEVELS = 'all_levels',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('courses')
@Index(['status', 'createdAt'])
@Index(['category'])
@Index(['instructorId'])
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index('IDX_COURSE_TITLE')
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 100, nullable: true })
  @Index()
  category: string;

  @Column({
    type: 'enum',
    enum: CourseLevel,
    default: CourseLevel.ALL_LEVELS,
  })
  @Index()
  level: CourseLevel;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'text', nullable: true })
  thumbnail: string;

  @Column({ type: 'text', nullable: true })
  previewVideo: string;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  @Index()
  status: CourseStatus;

  @Column({ type: 'uuid' })
  @Index()
  instructorId: string; // User ID from identity service

  @Column({ type: 'text', nullable: true })
  instructorName: string; // Denormalized for performance

  @Column({ type: 'int', default: 0 })
  enrollmentCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'simple-array', nullable: true })
  requirements: string[];

  @Column({ type: 'simple-array', nullable: true })
  whatYouWillLearn: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'varchar', length: 10, nullable: true })
  language: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  // Relations
  @OneToMany(() => Section, (section) => section.course, {
    cascade: true,
  })
  sections: Section[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  // Virtual fields (computed)
  totalLessons?: number;
  totalDuration?: number;
}
