import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Course,
  Section,
  Lesson,
  Enrollment,
  LessonProgress,
} from '../../shareds/entities';
import { CourseController } from './course.controller';
import { CourseAdminController } from './course-admin.controller';
import { CourseService } from './course.service';
import { CourseAdminService } from './course-admin.service';
import { EnrollmentService } from './enrollment.service';
import { ProgressService } from './progress.service';
import { R2StorageService } from '../../shareds/services/r2-storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Section,
      Lesson,
      Enrollment,
      LessonProgress,
    ]),
  ],
  controllers: [CourseController, CourseAdminController],
  providers: [
    CourseService,
    CourseAdminService,
    EnrollmentService,
    ProgressService,
    R2StorageService,
  ],
  exports: [
    CourseService,
    CourseAdminService,
    EnrollmentService,
    ProgressService,
    R2StorageService,
  ],
})
export class CourseModule {}
