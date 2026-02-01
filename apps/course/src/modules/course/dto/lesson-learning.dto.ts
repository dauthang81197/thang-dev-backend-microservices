import { IsUUID, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteLessonDto {
  @ApiProperty({
    description: 'User ID completing the lesson',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'Video watched duration in seconds',
    example: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  watchedDuration?: number;
}

export class UncompleteLessonDto {
  @ApiProperty({
    description: 'User ID uncompleting the lesson',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;
}

export class GetLessonDto {
  @ApiProperty({
    description: 'User ID requesting the lesson',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;
}

export class CourseProgressResponseDto {
  courseId: string;
  courseName: string;
  progressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  sections: SectionProgressDto[];
}

export class SectionProgressDto {
  sectionId: string;
  sectionName: string;
  sectionOrder: number;
  lessons: LessonProgressDto[];
}

export class LessonProgressDto {
  lessonId: string;
  lessonName: string;
  lessonOrder: number;
  lessonType: string;
  duration: number;
  completed: boolean;
  completedAt: Date | null;
  watchedDuration: number;
}

export class LessonDetailResponseDto {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: number;
  order: number;
  isPreview: boolean;
  videoUrl: string | null;
  content: string | null;
  sectionId: string;
  sectionName: string;
  courseId: string;
  courseName: string;
  completed: boolean;
  watchedDuration: number;
  canAccess: boolean;
  testField?: string;
  transcriptContent?: string | null;
  transcriptLanguage?: string | null;
  transcriptSource?: string | null;
  transcriptDuration?: number | null;
  transcriptWordCount?: number | null;
  transcriptSegmentsJson?: string | null;
  transcript?: {
    content: string;
    segments: Array<{
      start: number;
      end: number;
      text: string;
    }>;
    language: string;
    source: string;
    duration: number;
    wordCount: number;
  } | null;
}
