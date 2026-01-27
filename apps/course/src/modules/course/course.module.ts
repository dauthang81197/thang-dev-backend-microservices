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
import { CourseService } from './course.service';
import { EnrollmentService } from './enrollment.service';
import { ProgressService } from './progress.service';

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
  controllers: [CourseController],
  providers: [CourseService, EnrollmentService, ProgressService],
  exports: [CourseService, EnrollmentService, ProgressService],
})
export class CourseModule {}
