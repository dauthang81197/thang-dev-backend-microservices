import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { firstValueFrom } from 'rxjs';
import {
  CompleteLessonDto,
  UncompleteLessonDto,
} from './dto/lesson-learning.dto';

@ApiTags('Lessons (Learning)')
@Controller('lessons')
export class LessonGatewayController {
  constructor(
    @Inject('COURSE_SERVICE') private readonly courseClient: ClientProxy,
  ) {}

  @Get(':lessonId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get lesson detail',
    description:
      'Get lesson details. Preview lessons are accessible to everyone. Non-preview lessons require enrollment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson details retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Not enrolled in course' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async getLesson(@Param('lessonId') lessonId: string, @Request() req: any) {
    const userId = req.user.userId;
    return firstValueFrom(
      this.courseClient.send('lesson.get', { lessonId, userId }),
    );
  }

  @Post(':lessonId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark lesson as completed',
    description:
      'Mark a lesson as completed. User must be enrolled in the course.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson marked as completed',
  })
  @ApiResponse({ status: 403, description: 'Not enrolled in course' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async completeLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: CompleteLessonDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return firstValueFrom(
      this.courseClient.send('lesson.complete', {
        lessonId,
        userId,
        watchedDuration: dto.watchedDuration,
      }),
    );
  }

  @Post(':lessonId/uncomplete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark lesson as uncompleted',
    description:
      'Remove completion status from a lesson. User must be enrolled in the course.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson marked as uncompleted',
  })
  @ApiResponse({ status: 403, description: 'Not enrolled in course' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async uncompleteLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: UncompleteLessonDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return firstValueFrom(
      this.courseClient.send('lesson.uncomplete', { lessonId, userId }),
    );
  }
}
