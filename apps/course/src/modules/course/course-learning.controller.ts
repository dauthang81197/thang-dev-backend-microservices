import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CourseLearningService } from './course-learning.service';

@Controller()
export class CourseLearningController {
  private readonly logger = new Logger(CourseLearningController.name);

  constructor(private readonly courseLearningService: CourseLearningService) {}

  @MessagePattern('lesson.get')
  async getLesson(@Payload() data: { lessonId: string; userId: string }) {
    this.logger.log(`Getting lesson ${data.lessonId} for user ${data.userId}`);
    return this.courseLearningService.getLessonDetail(
      data.lessonId,
      data.userId,
    );
  }

  @MessagePattern('lesson.complete')
  async completeLesson(
    @Payload()
    data: {
      lessonId: string;
      userId: string;
      watchedDuration?: number;
    },
  ) {
    this.logger.log(
      `Completing lesson ${data.lessonId} for user ${data.userId}`,
    );
    return this.courseLearningService.completeLesson(
      data.lessonId,
      data.userId,
      data.watchedDuration,
    );
  }

  @MessagePattern('lesson.uncomplete')
  async uncompleteLesson(
    @Payload() data: { lessonId: string; userId: string },
  ) {
    this.logger.log(
      `Uncompleting lesson ${data.lessonId} for user ${data.userId}`,
    );
    return this.courseLearningService.uncompleteLesson(
      data.lessonId,
      data.userId,
    );
  }

  @MessagePattern('course.progress')
  async getCourseProgress(
    @Payload() data: { courseId: string; userId: string },
  ) {
    this.logger.log(
      `Getting course progress for course ${data.courseId}, user ${data.userId}`,
    );
    return this.courseLearningService.getCourseProgress(
      data.courseId,
      data.userId,
    );
  }

  @MessagePattern('lesson.transcript.get')
  async getLessonTranscript(@Payload() data: { lessonId: string }) {
    this.logger.log(`Getting transcript for lesson ${data.lessonId}`);
    return this.courseLearningService.getLessonTranscript(data.lessonId);
  }
}
