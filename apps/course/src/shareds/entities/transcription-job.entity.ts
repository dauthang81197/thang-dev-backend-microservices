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

export enum TranscriptionJobStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Entity('transcription_jobs')
@Index(['status', 'createdAt'])
export class TranscriptionJob {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    @Index()
    lessonId: string;

    @Column({ type: 'varchar', length: 500 })
    videoKey: string; // R2 object key

    @Column({ type: 'text' })
    videoUrl: string; // R2 public URL or signed URL

    @Column({
        type: 'enum',
        enum: TranscriptionJobStatus,
        default: TranscriptionJobStatus.PENDING,
    })
    @Index()
    status: TranscriptionJobStatus;

    @Column({ type: 'int', default: 0 })
    retryCount: number; // Số lần retry nếu failed

    @Column({ type: 'text', nullable: true })
    errorMessage: string; // Lưu lỗi nếu failed

    @Column({ type: 'timestamp', nullable: true })
    processedAt: Date; // Thời gian bắt đầu xử lý

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date; // Thời gian hoàn thành

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lessonId' })
    lesson: Lesson;
}
