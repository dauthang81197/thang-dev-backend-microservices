import { Course } from '../../../shareds/entities/course.entity';

export class CourseListResponseDto {
  data: Course[];
  total: number;
  page: number;
  limit: number;
}
