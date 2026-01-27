import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CourseService } from './course.service';
import { EnrollmentService } from './enrollment.service';
import { ProgressService } from './progress.service';
import {
  GetCoursesQueryDto,
  CourseListResponseDto,
  CourseProgressResponseDto,
  EnrollmentResponseDto,
} from './dto';
import { Course } from '../../shareds/entities';

@Controller()
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly enrollmentService: EnrollmentService,
    private readonly progressService: ProgressService,
  ) {}

  /**
   * Message Pattern: courses.findAll
   * Get all published courses with filters and pagination
   */
  @MessagePattern('courses.findAll')
  async getCourses(
    @Payload() query: GetCoursesQueryDto,
  ): Promise<CourseListResponseDto> {
    return this.courseService.findAll(query);
  }

  /**
   * Message Pattern: courses.findEnrolled
   * Get courses that the user has enrolled in
   */
  @MessagePattern('courses.findEnrolled')
  async getEnrolledCourses(
    @Payload() payload: { userId: string },
  ): Promise<Course[]> {
    return this.courseService.findEnrolledCourses(payload.userId);
  }

  /**
   * Message Pattern: courses.findOne
   * Get detailed information about a specific course
   */
  @MessagePattern('courses.findOne')
  async getCourse(@Payload() payload: { id: string }): Promise<Course> {
    return this.courseService.findOne(payload.id);
  }

  /**
   * Message Pattern: courses.enroll
   * Enroll user in a course
   */
  @MessagePattern('courses.enroll')
  async enrollInCourse(
    @Payload() payload: { courseId: string; userId: string },
  ): Promise<EnrollmentResponseDto> {
    return this.enrollmentService.enrollUser(payload.userId, payload.courseId);
  }

  /**
   * Message Pattern: courses.getProgress
   * Get user's progress in a course
   */
  @MessagePattern('courses.getProgress')
  async getCourseProgress(
    @Payload() payload: { courseId: string; userId: string },
  ): Promise<CourseProgressResponseDto> {
    return this.progressService.getCourseProgress(
      payload.userId,
      payload.courseId,
    );
  }
}
