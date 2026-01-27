import { Module } from '@nestjs/common';
import { CourseModule } from './course/course.module';

export const BASE_PLATFORM_IMPORTS = [CourseModule];

export const RABBITMQ_IMPORTS = [];

@Module({
  imports: [...BASE_PLATFORM_IMPORTS, ...RABBITMQ_IMPORTS],
  controllers: [],
  providers: [],
})
export class BasePlatformModule {}
