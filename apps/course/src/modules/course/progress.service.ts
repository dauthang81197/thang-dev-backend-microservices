import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonProgress } from '../../shareds/entities';
import { EnrollmentService } from './enrollment.service';
import { CourseProgressResponseDto } from './dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(LessonProgress)
    private readonly progressRepository: Repository<LessonProgress>,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  async getCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<CourseProgressResponseDto> {
    // Verify user is enrolled
    const isEnrolled = await this.enrollmentService.isUserEnrolled(
      userId,
      courseId,
    );
    if (!isEnrolled) {
      throw new ForbiddenException('You must be enrolled to view progress');
    }

    // Get all lessons in the course with progress
    const result = await this.progressRepository
      .createQueryBuilder('progress')
      .innerJoin('progress.lesson', 'lesson')
      .innerJoin('lesson.section', 'section')
      .innerJoin('section.course', 'course')
      .where('course.id = :courseId', { courseId })
      .andWhere('progress.userId = :userId', { userId })
      .select('COUNT(lesson.id)', 'totalLessons')
      .addSelect(
        'COUNT(CASE WHEN progress.completed = true THEN 1 END)',
        'completedLessons',
      )
      .getRawOne();

    // Also get total lessons count (including ones without progress)
    const totalLessonsQuery = await this.progressRepository.query(
      `
      SELECT COUNT(l.id) as total
      FROM lessons l
      INNER JOIN sections s ON l."sectionId" = s.id
      WHERE s."courseId" = $1
    `,
      [courseId],
    );

    const totalLessons = parseInt(totalLessonsQuery[0]?.total || '0', 10);
    const completedLessons = parseInt(result?.completedLessons || '0', 10);
    const progressPercent =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      totalLessons,
      completedLessons,
      progressPercent: Math.round(progressPercent * 100) / 100, // Round to 2 decimals
    };
  }

  async markLessonComplete(
    userId: string,
    lessonId: string,
  ): Promise<LessonProgress> {
    let progress = await this.progressRepository.findOne({
      where: { userId, lessonId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      });
    } else {
      progress.completed = true;
      progress.completedAt = new Date();
    }

    return this.progressRepository.save(progress);
  }
}
