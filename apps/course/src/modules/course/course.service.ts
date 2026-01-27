import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseStatus } from '../../shareds/entities/course.entity';
import { Section } from '../../shareds/entities/section.entity';
import {
  GetCoursesQueryDto,
  CourseListResponseDto,
  CourseSectionsResponseDto,
  SectionResponseDto,
  LessonItemDto,
} from './dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) { }

  async findAll(query: GetCoursesQueryDto): Promise<CourseListResponseDto> {
    const { category, level, search, page = 1, limit = 10 } = query;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .where('course.status = :status', { status: CourseStatus.PUBLISHED });

    // Apply filters
    if (category) {
      queryBuilder.andWhere('course.category = :category', { category });
    }

    if (level) {
      queryBuilder.andWhere('course.level = :level', { level });
    }

    if (search) {
      queryBuilder.andWhere(
        '(course.title ILIKE :search OR course.description ILIKE :search OR course.tags && ARRAY[:search])',
        { search: `%${search}%` },
      );
    }

    // Order by popularity and date
    queryBuilder.orderBy('course.enrollmentCount', 'DESC');
    queryBuilder.addOrderBy('course.rating', 'DESC');
    queryBuilder.addOrderBy('course.createdAt', 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [courses, total] = await queryBuilder.getManyAndCount();
    console.log(courses, 'fasdlkhf');
    // Calculate virtual fields
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

    return {
      data: courses,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .where('course.id = :id', { id })
      .andWhere('course.status = :status', { status: CourseStatus.PUBLISHED })
      .orderBy('section.orderIndex', 'ASC')
      .addOrderBy('lesson.orderIndex', 'ASC')
      .getOne();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
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

    return course;
  }

  async findEnrolledCourses(userId: string): Promise<Course[]> {
    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .innerJoin('course.enrollments', 'enrollment')
      .leftJoinAndSelect('course.sections', 'section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .where('enrollment.userId = :userId', { userId })
      .andWhere('enrollment.status = :status', { status: 'active' })
      .orderBy('enrollment.lastAccessedAt', 'DESC')
      .addOrderBy('section.orderIndex', 'ASC')
      .addOrderBy('lesson.orderIndex', 'ASC')
      .getMany();

    // Calculate virtual fields
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

    return courses;
  }

  async exists(courseId: string): Promise<boolean> {
    const count = await this.courseRepository.count({
      where: { id: courseId, status: CourseStatus.PUBLISHED },
    });
    return count > 0;
  }

  async getCourseSections(
    courseId: string,
  ): Promise<CourseSectionsResponseDto> {
    // First, verify the course exists and is published
    const course = await this.courseRepository.findOne({
      where: { id: courseId, status: CourseStatus.PUBLISHED },
      select: ['id', 'title'],
    });

    if (!course) {
      throw new NotFoundException(
        `Course with ID ${courseId} not found or not published`,
      );
    }

    // Get all sections with lessons for the course
    const sections = await this.sectionRepository
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.lessons', 'lesson')
      .leftJoinAndSelect('lesson.children', 'childLesson')
      .where('section.courseId = :courseId', { courseId })
      .orderBy('section.orderIndex', 'ASC')
      .addOrderBy('lesson.orderIndex', 'ASC')
      .addOrderBy('childLesson.orderIndex', 'ASC')
      .getMany();

    // Transform sections to DTO format
    const sectionDtos: SectionResponseDto[] = sections.map((section) => {
      const lessons = this.buildLessonHierarchy(section.lessons);
      const totalDuration = section.lessons.reduce(
        (sum, lesson) => sum + lesson.duration,
        0,
      );

      return {
        id: section.id,
        title: section.title,
        description: section.description,
        orderIndex: section.orderIndex,
        courseId: section.courseId,
        lessonCount: section.lessons?.length || 0,
        totalDuration,
        lessons,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
      };
    });

    // Calculate totals
    const totalLessons = sections.reduce(
      (sum, section) => sum + (section.lessons?.length || 0),
      0,
    );
    const totalDuration = sections.reduce(
      (sum, section) =>
        sum +
        section.lessons.reduce((lessonSum, lesson) => lessonSum + lesson.duration, 0),
      0,
    );

    return {
      courseId: course.id,
      courseTitle: course.title,
      sections: sectionDtos,
      totalSections: sections.length,
      totalLessons,
      totalDuration,
    };
  }

  private buildLessonHierarchy(lessons: any[]): LessonItemDto[] {
    // Filter for parent lessons only (level 0 or no parent)
    const parentLessons = lessons.filter((lesson) => !lesson.parentId);

    return parentLessons.map((lesson) => {
      const lessonDto: LessonItemDto = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        duration: lesson.duration,
        orderIndex: lesson.orderIndex,
        isFree: lesson.isFree,
        level: lesson.level,
        childrenCount: lesson.childrenCount,
        videoKey: lesson.videoKey,
      };

      // Add children if they exist
      if (lesson.children && lesson.children.length > 0) {
        lessonDto.children = lesson.children.map((child: any) => ({
          id: child.id,
          title: child.title,
          description: child.description,
          type: child.type,
          duration: child.duration,
          orderIndex: child.orderIndex,
          isFree: child.isFree,
          parentId: child.parentId,
          level: child.level,
          childrenCount: child.childrenCount,
          videoKey: child.videoKey,
        }));
      }

      return lessonDto;
    });
  }
}
