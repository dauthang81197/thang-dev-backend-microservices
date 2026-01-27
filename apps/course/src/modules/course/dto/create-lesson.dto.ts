import {
  IsString,
  IsEnum,
  IsInt,
  IsBoolean,
  IsOptional,
  IsUUID,
  Min,
  MaxLength,
  IsArray,
} from 'class-validator';
import { LessonType } from '../../../shareds/entities/lesson.entity';

export class CreateLessonDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LessonType)
  type: LessonType;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @IsUUID()
  sectionId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  @IsUUID()
  @IsOptional()
  parentId?: string; // For hierarchical structure

  @IsString()
  @IsOptional()
  videoKey?: string; // R2 object key (will be set during upload)
}

export class UpdateLessonDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LessonType)
  @IsOptional()
  type?: LessonType;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class UploadVideoDto {
  @IsUUID()
  lessonId: string;
}
