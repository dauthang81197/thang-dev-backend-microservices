import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../shareds/entities/course.entity';
import { Section } from '../../shareds/entities/section.entity';
import { Lesson } from '../../shareds/entities/lesson.entity';
import { CreateCourseDto, UpdateCourseDto } from './dto/create-course.dto';
import { CreateSectionDto, UpdateSectionDto } from './dto/create-section.dto';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
import { MinioStorageService } from '../../shareds/services/minio-storage.service';

@Injectable()
export class CourseAdminService {
  private readonly logger = new Logger(CourseAdminService.name);

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    private minioStorageService: MinioStorageService,
  ) {}

  // ============ COURSE CRUD ============

  async findAllCourses(instructorId: string): Promise<Course[]> {
    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .where('course.instructorId = :instructorId', { instructorId })
      .orderBy('course.createdAt', 'DESC')
      .addOrderBy('section.orderIndex', 'ASC')
      .addOrderBy('lesson.orderIndex', 'ASC')
      .getMany();

    // Calculate virtual fields for each course
    courses.forEach((course) => {
      course.totalLessons = course.sections?.reduce(
        (acc, section) => acc + (section.lessons?.length || 0),
        0,
      );
      course.totalDuration = course.sections?.reduce(
        (acc, section) =>
          acc +
          (section.lessons?.reduce(
            (lessonAcc, lesson) => lessonAcc + lesson.duration,
            0,
          ) || 0),
        0,
      );
    });

    this.logger.log(
      `Found ${courses.length} courses for instructor: ${instructorId}`,
    );
    return courses;
  }

  async findOneCourse(courseId: string): Promise<Course> {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .where('course.id = :courseId', { courseId })
      .orderBy('section.orderIndex', 'ASC')
      .addOrderBy('lesson.orderIndex', 'ASC')
      .getOne();

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Calculate virtual fields
    course.totalLessons = course.sections?.reduce(
      (acc, section) => acc + (section.lessons?.length || 0),
      0,
    );
    course.totalDuration = course.sections?.reduce(
      (acc, section) =>
        acc +
        (section.lessons?.reduce(
          (lessonAcc, lesson) => lessonAcc + lesson.duration,
          0,
        ) || 0),
      0,
    );

    this.logger.log(`Found course: ${courseId}`);
    return course;
  }

  async createCourse(
    createCourseDto: CreateCourseDto,
    instructorId: string,
  ): Promise<Course> {
    const course = this.courseRepository.create({
      ...createCourseDto,
      instructorId,
    });
    console.log(
      createCourseDto,
      instructorId,
      'createCourseDtocreateCourseDto',
    );
    const savedCourse = await this.courseRepository.save(course);
    this.logger.log(`Course created: ${savedCourse.id}`);
    return savedCourse;
  }

  async updateCourse(
    courseId: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    Object.assign(course, updateCourseDto);
    const updatedCourse = await this.courseRepository.save(course);
    this.logger.log(`Course updated: ${courseId}`);
    return updatedCourse;
  }

  async deleteCourse(courseId: string): Promise<void> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Delete thumbnail from MinIO if exists
    if (course.thumbnail) {
      try {
        await this.minioStorageService.deleteFile(course.thumbnail);
      } catch (error) {
        this.logger.warn(`Failed to delete thumbnail: ${error.message}`);
      }
    }

    await this.courseRepository.remove(course);
    this.logger.log(`Course deleted: ${courseId}`);
  }

  async updateCourseThumbnail(
    courseId: string,
    thumbnail: string,
  ): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Delete old thumbnail from MinIO if exists and is different
    if (course.thumbnail && course.thumbnail !== thumbnail) {
      try {
        // Extract key from old thumbnail URL or use thumbnailKey if stored
        const oldKey = course.thumbnail.split('/').slice(-2).join('/'); // Extract folder/filename
        await this.minioStorageService.deleteFile(oldKey);
        this.logger.log(`Old thumbnail deleted: ${oldKey}`);
      } catch (error) {
        this.logger.warn(`Failed to delete old thumbnail: ${error.message}`);
      }
    }

    // Update course with new thumbnail
    course.thumbnail = thumbnail;
    const updatedCourse = await this.courseRepository.save(course);

    this.logger.log(`Course thumbnail updated: ${courseId}`);
    return updatedCourse;
  }

  // ============ SECTION CRUD ============

  async createSection(createSectionDto: CreateSectionDto): Promise<Section> {
    const { courseId } = createSectionDto;

    // Verify course exists
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const section = this.sectionRepository.create(createSectionDto);
    const savedSection = await this.sectionRepository.save(section);
    this.logger.log(`Section created: ${savedSection.id}`);
    return savedSection;
  }

  async updateSection(
    sectionId: string,
    updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    Object.assign(section, updateSectionDto);
    const updatedSection = await this.sectionRepository.save(section);
    this.logger.log(`Section updated: ${sectionId}`);
    return updatedSection;
  }

  async deleteSection(sectionId: string): Promise<void> {
    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    await this.sectionRepository.remove(section);
    this.logger.log(`Section deleted: ${sectionId}`);
  }

  // ============ LESSON CRUD ============

  async createLesson(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const { sectionId, parentId } = createLessonDto;

    // Verify section exists
    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
    });
    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Handle hierarchical structure
    let path = '';
    let level = 0;

    if (parentId) {
      const parent = await this.lessonRepository.findOne({
        where: { id: parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent lesson not found');
      }

      // Build materialized path
      path = parent.path ? `${parent.path}.${parentId}` : parentId;
      level = parent.level + 1;

      // Increment parent's children count
      parent.childrenCount += 1;
      await this.lessonRepository.save(parent);
    }

    const lesson = this.lessonRepository.create({
      ...createLessonDto,
      path,
      level,
    });

    const savedLesson = await this.lessonRepository.save(lesson);
    this.logger.log(`Lesson created: ${savedLesson.id}`);
    return savedLesson;
  }

  async updateLesson(
    lessonId: string,
    updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // If parent is being changed, handle tree restructuring
    if (
      updateLessonDto.parentId !== undefined &&
      updateLessonDto.parentId !== lesson.parentId
    ) {
      await this.updateLessonParent(lesson, updateLessonDto.parentId);
    }

    Object.assign(lesson, updateLessonDto);
    const updatedLesson = await this.lessonRepository.save(lesson);
    this.logger.log(`Lesson updated: ${lessonId}`);
    return updatedLesson;
  }

  async deleteLesson(lessonId: string): Promise<void> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Delete video from MinIO if exists
    if (lesson.videoKey) {
      try {
        await this.minioStorageService.deleteFile(lesson.videoKey);
      } catch (error) {
        this.logger.warn(`Failed to delete video: ${error.message}`);
      }
    }

    // Decrement parent's children count
    if (lesson.parentId) {
      const parent = await this.lessonRepository.findOne({
        where: { id: lesson.parentId },
      });
      if (parent) {
        parent.childrenCount = Math.max(0, parent.childrenCount - 1);
        await this.lessonRepository.save(parent);
      }
    }

    await this.lessonRepository.remove(lesson);
    this.logger.log(`Lesson deleted: ${lessonId}`);
  }

  // ============ VIDEO UPLOAD ============

  /**
   * Update lesson with video metadata (new optimized method)
   * File is uploaded directly from API Gateway to R2
   */
  async updateLessonVideoMetadata(
    lessonId: string,
    videoKey: string,
    videoSize: number,
    videoFormat: string,
  ): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Delete old video if exists
    if (lesson.videoKey && lesson.videoKey !== videoKey) {
      try {
        await this.minioStorageService.deleteFile(lesson.videoKey);
        this.logger.log(`Old video deleted: ${lesson.videoKey}`);
      } catch (error) {
        this.logger.warn(`Failed to delete old video: ${error.message}`);
      }
    }

    // Update lesson with new video metadata
    lesson.videoKey = videoKey;
    lesson.videoSize = videoSize;
    lesson.videoFormat = videoFormat;
    lesson.content = videoKey; // Store R2 key in content field

    const updatedLesson = await this.lessonRepository.save(lesson);
    this.logger.log(`Video metadata updated for lesson: ${lessonId}`);
    return updatedLesson;
  }

  /**
   * Upload lesson video (legacy method - slower through Redis)
   * Kept for backward compatibility
   */
  async uploadLessonVideo(
    lessonId: string,
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
  ): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Validate file type
    const allowedMimeTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only video files are allowed.',
      );
    }

    // Delete old video if exists
    if (lesson.videoKey) {
      try {
        await this.minioStorageService.deleteFile(lesson.videoKey);
      } catch (error) {
        this.logger.warn(`Failed to delete old video: ${error.message}`);
      }
    }

    // Upload to MinIO
    const videoKey = await this.minioStorageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'videos',
    );

    // Update lesson with video metadata
    lesson.videoKey = videoKey;
    lesson.videoSize = file.size;
    lesson.videoFormat = file.mimetype.split('/')[1];
    lesson.content = videoKey; // Store R2 key in content field

    const updatedLesson = await this.lessonRepository.save(lesson);
    this.logger.log(`Video uploaded for lesson: ${lessonId}`);
    return updatedLesson;
  }

  async getLessonVideoUrl(lessonId: string): Promise<string> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (!lesson.videoKey) {
      throw new NotFoundException('No video found for this lesson');
    }

    // Generate presigned URL (expires in 1 hour)
    const url = await this.minioStorageService.getPresignedUrl(
      lesson.videoKey,
      3600,
    );

    return url;
  }

  // ============ HELPER METHODS ============

  private async updateLessonParent(
    lesson: Lesson,
    newParentId: string | null,
  ): Promise<void> {
    // Decrement old parent's children count
    if (lesson.parentId) {
      const oldParent = await this.lessonRepository.findOne({
        where: { id: lesson.parentId },
      });
      if (oldParent) {
        oldParent.childrenCount = Math.max(0, oldParent.childrenCount - 1);
        await this.lessonRepository.save(oldParent);
      }
    }

    // Update new parent
    if (newParentId) {
      const newParent = await this.lessonRepository.findOne({
        where: { id: newParentId },
      });

      if (!newParent) {
        throw new NotFoundException('New parent lesson not found');
      }

      lesson.parentId = newParentId;
      lesson.path = newParent.path
        ? `${newParent.path}.${newParentId}`
        : newParentId;
      lesson.level = newParent.level + 1;

      newParent.childrenCount += 1;
      await this.lessonRepository.save(newParent);
    } else {
      // Moving to root level
      lesson.parentId = null;
      lesson.path = null;
      lesson.level = 0;
    }
  }

  // Get lesson tree for a section
  async getLessonTree(sectionId: string): Promise<Lesson[]> {
    const lessons = await this.lessonRepository.find({
      where: { sectionId },
      order: { level: 'ASC', orderIndex: 'ASC' },
    });

    return this.buildLessonTree(lessons);
  }

  private buildLessonTree(lessons: Lesson[]): Lesson[] {
    const lessonMap = new Map<string, Lesson & { children?: Lesson[] }>();
    const rootLessons: Lesson[] = [];

    // Create a map of all lessons
    lessons.forEach((lesson) => {
      lessonMap.set(lesson.id, { ...lesson, children: [] });
    });

    // Build the tree structure
    lessons.forEach((lesson) => {
      const lessonNode = lessonMap.get(lesson.id);
      if (!lessonNode) return;

      if (lesson.parentId && lessonMap.has(lesson.parentId)) {
        const parent = lessonMap.get(lesson.parentId);
        if (parent && parent.children) {
          parent.children.push(lessonNode);
        }
      } else {
        rootLessons.push(lessonNode);
      }
    });

    return rootLessons;
  }
}
