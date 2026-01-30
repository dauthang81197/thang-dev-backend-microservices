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

  @MessagePattern('course.admin.findAll')
  async getAllCourses(@Payload() data: { instructorId: string }) {
    this.logger.log(`Getting all courses for instructor: ${data.instructorId}`);
    return this.courseAdminService.findAllCourses(data.instructorId);
  }

  @MessagePattern('course.admin.findOne')
  async getCourse(@Payload() data: { courseId: string }) {
    this.logger.log(`Getting course: ${data.courseId}`);
    return this.courseAdminService.findOneCourse(data.courseId);
  }

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

  @MessagePattern('course.admin.update-thumbnail')
  async updateCourseThumbnail(
    @Payload()
    data: {
      courseId: string;
      thumbnail: string;
      thumbnailKey: string;
    },
  ) {
    this.logger.log(`Updating thumbnail for course: ${data.courseId}`);
    return this.courseAdminService.updateCourseThumbnail(
      data.courseId,
      data.thumbnail,
    );
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

  // ============ VIDEO UPLOAD (R2) ============

  @MessagePattern('course.admin.lesson.video-metadata')
  async updateLessonVideoMetadata(
    @Payload()
    data: {
      lessonId: string;
      videoKey: string;
      videoSize: number;
      videoFormat: string;
    },
  ) {
    this.logger.log(`Updating video metadata for lesson: ${data.lessonId}`);
    return this.courseAdminService.updateLessonVideoMetadata(
      data.lessonId,
      data.videoKey,
      data.videoSize,
      data.videoFormat,
    );
  }

  @MessagePattern('course.admin.lesson.video-upload')
  async uploadLessonVideo(
    @Payload()
    data: {
      lessonId: string;
      file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
        size: number;
      };
    },
  ) {
    this.logger.log(
      `Uploading video for lesson: ${data.lessonId} (Legacy method)`,
    );
    // Convert buffer if needed (microservice transport may serialize it)
    if (data.file.buffer && typeof data.file.buffer === 'object') {
      data.file.buffer = Buffer.from(Object.values(data.file.buffer));
    }
    return this.courseAdminService.uploadLessonVideo(data.lessonId, data.file);
  }

  @MessagePattern('course.admin.lesson.video-url')
  async getLessonVideoUrl(@Payload() data: { lessonId: string }) {
    this.logger.log(`Getting video URL for lesson: ${data.lessonId}`);
    return this.courseAdminService.getLessonVideoUrl(data.lessonId);
  }
}
