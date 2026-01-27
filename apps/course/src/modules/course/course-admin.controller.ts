import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CourseAdminService } from './course-admin.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/create-course.dto';
import { CreateSectionDto, UpdateSectionDto } from './dto/create-section.dto';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';

@Controller()
export class CourseAdminController {
  private readonly logger = new Logger(CourseAdminController.name);

  constructor(private readonly courseAdminService: CourseAdminService) {}

  // ============ COURSE CRUD ============

  @MessagePattern('course.admin.create')
  async createCourse(
    @Payload() data: { dto: CreateCourseDto; instructorId: string },
  ) {
    this.logger.log('Creating course via admin');
    return this.courseAdminService.createCourse(data.dto, data.instructorId);
  }

  @MessagePattern('course.admin.update')
  async updateCourse(
    @Payload() data: { courseId: string; dto: UpdateCourseDto },
  ) {
    this.logger.log(`Updating course: ${data.courseId}`);
    return this.courseAdminService.updateCourse(data.courseId, data.dto);
  }

  @MessagePattern('course.admin.delete')
  async deleteCourse(@Payload() data: { courseId: string }) {
    this.logger.log(`Deleting course: ${data.courseId}`);
    await this.courseAdminService.deleteCourse(data.courseId);
    return { success: true };
  }

  // ============ SECTION CRUD ============

  @MessagePattern('course.admin.section.create')
  async createSection(@Payload() dto: CreateSectionDto) {
    this.logger.log('Creating section via admin');
    return this.courseAdminService.createSection(dto);
  }

  @MessagePattern('course.admin.section.update')
  async updateSection(
    @Payload() data: { sectionId: string; dto: UpdateSectionDto },
  ) {
    this.logger.log(`Updating section: ${data.sectionId}`);
    return this.courseAdminService.updateSection(data.sectionId, data.dto);
  }

  @MessagePattern('course.admin.section.delete')
  async deleteSection(@Payload() data: { sectionId: string }) {
    this.logger.log(`Deleting section: ${data.sectionId}`);
    await this.courseAdminService.deleteSection(data.sectionId);
    return { success: true };
  }

  // ============ LESSON CRUD ============

  @MessagePattern('course.admin.lesson.create')
  async createLesson(@Payload() dto: CreateLessonDto) {
    this.logger.log('Creating lesson via admin');
    return this.courseAdminService.createLesson(dto);
  }

  @MessagePattern('course.admin.lesson.update')
  async updateLesson(
    @Payload() data: { lessonId: string; dto: UpdateLessonDto },
  ) {
    this.logger.log(`Updating lesson: ${data.lessonId}`);
    return this.courseAdminService.updateLesson(data.lessonId, data.dto);
  }

  @MessagePattern('course.admin.lesson.delete')
  async deleteLesson(@Payload() data: { lessonId: string }) {
    this.logger.log(`Deleting lesson: ${data.lessonId}`);
    await this.courseAdminService.deleteLesson(data.lessonId);
    return { success: true };
  }

  @MessagePattern('course.admin.lesson.tree')
  async getLessonTree(@Payload() data: { sectionId: string }) {
    this.logger.log(`Getting lesson tree for section: ${data.sectionId}`);
    return this.courseAdminService.getLessonTree(data.sectionId);
  }

  @MessagePattern('course.admin.lesson.video-url')
  async getLessonVideoUrl(@Payload() data: { lessonId: string }) {
    this.logger.log(`Getting video URL for lesson: ${data.lessonId}`);
    return this.courseAdminService.getLessonVideoUrl(data.lessonId);
  }
}
