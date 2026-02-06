import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Course,
  Section,
  Lesson,
  Enrollment,
  LessonProgress,
  TranscriptionJob,
  Transcript,
} from '../../shareds/entities';
import { CourseController } from './course.controller';
import { CourseAdminController } from './course-admin.controller';
import { CourseLearningController } from './course-learning.controller';
import { CourseService } from './course.service';
import { CourseAdminService } from './course-admin.service';
import { CourseLearningService } from './course-learning.service';
import { EnrollmentService } from './enrollment.service';
import { ProgressService } from './progress.service';
import { MinioStorageService } from '../../shareds/services/minio-storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Section,
      Lesson,
      Enrollment,
      LessonProgress,
      TranscriptionJob,
      Transcript,
    ]),
  ],
  controllers: [
    CourseController,
    CourseAdminController,
    CourseLearningController,
  ],
  providers: [
    CourseService,
    CourseAdminService,
    CourseLearningService,
    EnrollmentService,
    ProgressService,
    MinioStorageService,
  ],
  exports: [
    CourseService,
    CourseAdminService,
    CourseLearningService,
    EnrollmentService,
    ProgressService,
    MinioStorageService,
  ],
})
export class CourseModule {}
