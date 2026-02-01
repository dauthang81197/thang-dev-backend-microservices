import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GetUser } from '@app/common';
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
  ) { }

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
  async getLesson(
    @Param('lessonId') lessonId: string,
    @GetUser('id') userId: string,
  ) {
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
    @GetUser('id') userId: string,
  ) {
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
    @GetUser('id') userId: string,
  ) {
    return firstValueFrom(
      this.courseClient.send('lesson.uncomplete', { lessonId, userId }),
    );
  }

  @Get(':lessonId/transcript')
  @ApiOperation({
    summary: 'Get lesson transcript',
    description: 'Get video transcript/subtitles for a lesson',
  })
  @ApiResponse({
    status: 200,
    description: 'Transcript retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Lesson or transcript not found' })
  async getLessonTranscript(@Param('lessonId') lessonId: string) {
    return firstValueFrom(
      this.courseClient.send('lesson.transcript.get', { lessonId }),
    );
  }
}
