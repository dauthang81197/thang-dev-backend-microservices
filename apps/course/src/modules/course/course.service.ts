import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseStatus } from '../../shareds/entities/course.entity';
import { GetCoursesQueryDto, CourseListResponseDto } from './dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

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
}
