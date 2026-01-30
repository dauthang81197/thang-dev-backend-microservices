export class LessonItemDto {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: number;
  orderIndex: number;
  isFree: boolean;
  parentId?: string;
  level: number;
  childrenCount: number;
  videoKey?: string;
  children?: LessonItemDto[];
}

export class SectionResponseDto {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  courseId: string;
  lessonCount: number;
  totalDuration: number;
  lessons: LessonItemDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class CourseSectionsResponseDto {
  courseId: string;
  courseTitle: string;
  sections: SectionResponseDto[];
  totalSections: number;
  totalLessons: number;
  totalDuration: number;
}
