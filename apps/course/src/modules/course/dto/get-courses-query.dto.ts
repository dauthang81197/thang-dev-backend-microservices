import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseLevel } from '../../../shareds/entities/course.entity';

export class GetCoursesQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
