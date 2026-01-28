import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Lesson } from '../../shareds/entities/lesson.entity';
import { LessonProgress } from '../../shareds/entities/lesson-progress.entity';
import { Enrollment } from '../../shareds/entities/enrollment.entity';
import { Section } from '../../shareds/entities/section.entity';
import { Course } from '../../shareds/entities/course.entity';
import {
  LessonDetailResponseDto,
  CourseProgressResponseDto,
  SectionProgressDto,
  LessonProgressDto,
} from './dto/lesson-learning.dto';
import { R2StorageService } from '../../shareds/services/r2-storage.service';

@Injectable()
export class CourseLearningService {
  private readonly logger = new Logger(CourseLearningService.name);

  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private readonly lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly dataSource: DataSource,
    private readonly r2StorageService: R2StorageService,
  ) {}

  /**
   * Get lesson detail with access control
   * - Preview lessons: accessible to everyone
   * - Non-preview lessons: require enrollment
   */
  async getLessonDetail(
    lessonId: string,
    userId: string,
  ): Promise<LessonDetailResponseDto> {
    // Find lesson with relations
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['section', 'section.course'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const section = lesson.section;
    const course = section.course;

    // Check enrollment
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        userId,
        courseId: course.id,
      },
    });

    const isEnrolled = !!enrollment;
    const canAccess = lesson.isFree || isEnrolled;

    if (!canAccess) {
      throw new ForbiddenException(
        'You must enroll in this course to access this lesson',
      );
    }

    // Get progress if enrolled
    let progress: LessonProgress | null = null;
    if (isEnrolled) {
      progress = await this.lessonProgressRepository.findOne({
        where: {
          userId,
          lessonId: lesson.id,
        },
      });
    }

    // Get video URL if has video
    let videoUrl: string | null = null;
    if (lesson.videoKey) {
      videoUrl = await this.r2StorageService.getPresignedUrl(
        lesson.videoKey,
        3600,
      );
    }

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || '',
      type: lesson.type,
      duration: lesson.duration,
      order: lesson.orderIndex,
      isPreview: lesson.isFree,
      videoUrl: lesson.isFree || isEnrolled ? videoUrl : null,
      content: lesson.content,
      sectionId: section.id,
      sectionName: section.title,
      courseId: course.id,
      courseName: course.title,
      completed: progress?.completed || false,
      watchedDuration: progress?.watchedDuration || 0,
      canAccess,
    };
  }

  /**
   * Mark lesson as completed
   */
  async completeLesson(
    lessonId: string,
    userId: string,
    watchedDuration?: number,
  ): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find lesson
      const lesson = await queryRunner.manager.findOne(Lesson, {
        where: { id: lessonId },
        relations: ['section', 'section.course'],
      });

      if (!lesson) {
        throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
      }

      const courseId = lesson.section.course.id;

      // Check enrollment
      const enrollment = await queryRunner.manager.findOne(Enrollment, {
        where: { userId, courseId },
      });

      if (!enrollment) {
        throw new ForbiddenException(
          'You must enroll in this course to mark lessons as completed',
        );
      }

      // Find or create lesson progress
      let lessonProgress = await queryRunner.manager.findOne(LessonProgress, {
        where: { userId, lessonId },
      });

      if (!lessonProgress) {
        lessonProgress = queryRunner.manager.create(LessonProgress, {
          userId,
          lessonId,
          completed: true,
          completedAt: new Date(),
          watchedDuration: watchedDuration || 0,
        });
      } else {
        lessonProgress.completed = true;
        lessonProgress.completedAt = new Date();
        if (watchedDuration !== undefined) {
          lessonProgress.watchedDuration = watchedDuration;
        }
      }

      await queryRunner.manager.save(LessonProgress, lessonProgress);

      // Update enrollment progress
      await this.updateEnrollmentProgress(queryRunner, enrollment.id);

      await queryRunner.commitTransaction();

      this.logger.log(
        `User ${userId} completed lesson ${lessonId} in course ${courseId}`,
      );

      return {
        success: true,
        message: 'Lesson marked as completed',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Mark lesson as uncompleted
   */
  async uncompleteLesson(
    lessonId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find lesson
      const lesson = await queryRunner.manager.findOne(Lesson, {
        where: { id: lessonId },
        relations: ['section', 'section.course'],
      });

      if (!lesson) {
        throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
      }

      const courseId = lesson.section.course.id;

      // Check enrollment
      const enrollment = await queryRunner.manager.findOne(Enrollment, {
        where: { userId, courseId },
      });

      if (!enrollment) {
        throw new ForbiddenException(
          'You must enroll in this course to manage lesson progress',
        );
      }

      // Find lesson progress
      const lessonProgress = await queryRunner.manager.findOne(LessonProgress, {
        where: { userId, lessonId },
      });

      if (!lessonProgress) {
        throw new BadRequestException('Lesson progress not found');
      }

      lessonProgress.completed = false;
      lessonProgress.completedAt = null as any;

      await queryRunner.manager.save(LessonProgress, lessonProgress);

      // Update enrollment progress
      await this.updateEnrollmentProgress(queryRunner, enrollment.id);

      await queryRunner.commitTransaction();

      this.logger.log(
        `User ${userId} uncompleted lesson ${lessonId} in course ${courseId}`,
      );

      return {
        success: true,
        message: 'Lesson marked as uncompleted',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get detailed course progress with sections and lessons
   */
  async getCourseProgress(
    courseId: string,
    userId: string,
  ): Promise<CourseProgressResponseDto> {
    // Check enrollment
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    // Get course with sections and lessons
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['sections', 'sections.lessons'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Get all lesson progress for user in this course
    const allLessonIds = course.sections.flatMap((section) =>
      section.lessons.map((lesson) => lesson.id),
    );

    const progressRecords = await this.lessonProgressRepository.find({
      where: {
        userId,
        lessonId: allLessonIds.length > 0 ? In(allLessonIds) : undefined,
      },
    });

    const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p]));

    // Build response
    const sections: SectionProgressDto[] = course.sections
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      .map((section) => {
        const lessons: LessonProgressDto[] = section.lessons
          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
          .map((lesson) => {
            const progress = progressMap.get(lesson.id);
            return {
              lessonId: lesson.id,
              lessonName: lesson.title,
              lessonOrder: lesson.orderIndex,
              lessonType: lesson.type,
              duration: lesson.duration,
              completed: progress?.completed || false,
              completedAt: progress?.completedAt || null,
              watchedDuration: progress?.watchedDuration || 0,
            };
          });

        return {
          sectionId: section.id,
          sectionName: section.title,
          sectionOrder: section.orderIndex || 0,
          lessons,
        };
      });

    const totalLessons = allLessonIds.length;
    const completedLessons = progressRecords.filter((p) => p.completed).length;
    const progressPercent =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      courseId: course.id,
      courseName: course.title,
      progressPercent: Math.round(progressPercent * 100) / 100,
      completedLessonsCount: completedLessons,
      totalLessonsCount: totalLessons,
      sections,
    };
  }

  /**
   * Update enrollment progress based on completed lessons
   */
  private async updateEnrollmentProgress(
    queryRunner: any,
    enrollmentId: string,
  ): Promise<void> {
    const enrollment = await queryRunner.manager.findOne(Enrollment, {
      where: { id: enrollmentId },
      relations: ['course', 'course.sections', 'course.sections.lessons'],
    });

    if (!enrollment) {
      return;
    }

    // Count total lessons in course
    const totalLessons = enrollment.course.sections.reduce(
      (sum, section) => sum + section.lessons.length,
      0,
    );

    // Count completed lessons
    const allLessonIds = enrollment.course.sections.flatMap((section) =>
      section.lessons.map((lesson) => lesson.id),
    );

    const completedCount = await queryRunner.manager.count(LessonProgress, {
      where: {
        userId: enrollment.userId,
        lessonId: allLessonIds.length > 0 ? In(allLessonIds) : undefined,
        completed: true,
      },
    });

    // Calculate progress
    const progress =
      totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    // Update enrollment
    enrollment.progress = Math.round(progress * 100) / 100;
    enrollment.lastAccessedAt = new Date();

    await queryRunner.manager.save(Enrollment, enrollment);
  }
}

// Import In for TypeORM
import { In } from 'typeorm';
