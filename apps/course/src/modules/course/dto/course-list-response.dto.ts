import { Course } from '../../../shareds/entities/course.entity';

export class CourseListResponseDto {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}
