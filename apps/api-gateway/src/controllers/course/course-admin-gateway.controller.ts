import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Inject,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { firstValueFrom } from 'rxjs';

// DTOs - Define inline or import from shared lib
interface CreateCourseDto {
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail?: string;
  price?: number;
  discountPrice?: number;
  language?: string;
  tags?: string[];
  status?: string;
}

interface UpdateCourseDto {
  title?: string;
  description?: string;
  category?: string;
  level?: string;
  thumbnail?: string;
  price?: number;
  discountPrice?: number;
  language?: string;
  tags?: string[];
  status?: string;
}

interface CreateSectionDto {
  title: string;
  description?: string;
  orderIndex: number;
  courseId: string;
}

interface UpdateSectionDto {
  title?: string;
  description?: string;
  orderIndex?: number;
}

interface CreateLessonDto {
  title: string;
  description?: string;
  type: string;
  content?: string;
  duration?: number;
  orderIndex: number;
  isFree?: boolean;
  sectionId: string;
  attachments?: string[];
  parentId?: string;
  videoKey?: string;
}

interface UpdateLessonDto {
  title?: string;
  description?: string;
  type?: string;
  content?: string;
  duration?: number;
  orderIndex?: number;
  isFree?: boolean;
  attachments?: string[];
  parentId?: string;
}

@ApiTags('Course Admin')
@ApiBearerAuth()
@Controller('admin/courses')
@UseGuards(JwtAuthGuard)
export class CourseAdminGatewayController {
  constructor(
    @Inject('COURSE_SERVICE') private readonly courseClient: ClientProxy,
  ) {}

  // ============ COURSE CRUD ============

  @Post()
  @ApiOperation({ summary: 'Create new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  async createCourse(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    const instructorId = req.user.id; // From JWT token
    return firstValueFrom(
      this.courseClient.send('course.admin.create', {
        dto: createCourseDto,
        instructorId,
      }),
    );
  }

  @Put(':courseId')
  @ApiOperation({ summary: 'Update course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  async updateCourse(
    @Param('courseId') courseId: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return firstValueFrom(
      this.courseClient.send('course.admin.update', {
        courseId,
        dto: updateCourseDto,
      }),
    );
  }

  @Delete(':courseId')
  @ApiOperation({ summary: 'Delete course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  async deleteCourse(@Param('courseId') courseId: string) {
    return firstValueFrom(
      this.courseClient.send('course.admin.delete', { courseId }),
    );
  }

  // ============ SECTION CRUD ============

  @Post('sections')
  @ApiOperation({ summary: 'Create new section' })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  async createSection(@Body() createSectionDto: CreateSectionDto) {
    return firstValueFrom(
      this.courseClient.send('course.admin.section.create', createSectionDto),
    );
  }

  @Put('sections/:sectionId')
  @ApiOperation({ summary: 'Update section' })
  @ApiResponse({ status: 200, description: 'Section updated successfully' })
  async updateSection(
    @Param('sectionId') sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return firstValueFrom(
      this.courseClient.send('course.admin.section.update', {
        sectionId,
        dto: updateSectionDto,
      }),
    );
  }

  @Delete('sections/:sectionId')
  @ApiOperation({ summary: 'Delete section' })
  @ApiResponse({ status: 200, description: 'Section deleted successfully' })
  async deleteSection(@Param('sectionId') sectionId: string) {
    return firstValueFrom(
      this.courseClient.send('course.admin.section.delete', { sectionId }),
    );
  }

  // ============ LESSON CRUD ============

  @Post('lessons')
  @ApiOperation({ summary: 'Create new lesson' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  async createLesson(@Body() createLessonDto: CreateLessonDto) {
    return firstValueFrom(
      this.courseClient.send('course.admin.lesson.create', createLessonDto),
    );
  }

  @Put('lessons/:lessonId')
  @ApiOperation({ summary: 'Update lesson' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return firstValueFrom(
      this.courseClient.send('course.admin.lesson.update', {
        lessonId,
        dto: updateLessonDto,
      }),
    );
  }

  @Delete('lessons/:lessonId')
  @ApiOperation({ summary: 'Delete lesson' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  async deleteLesson(@Param('lessonId') lessonId: string) {
    return firstValueFrom(
      this.courseClient.send('course.admin.lesson.delete', { lessonId }),
    );
  }

  @Get('sections/:sectionId/lessons/tree')
  @ApiOperation({ summary: 'Get lesson tree for section' })
  @ApiResponse({
    status: 200,
    description: 'Returns hierarchical lesson structure',
  })
  async getLessonTree(@Param('sectionId') sectionId: string) {
    return firstValueFrom(
      this.courseClient.send('course.admin.lesson.tree', { sectionId }),
    );
  }

  // ============ VIDEO UPLOAD ============

  @Post('lessons/:lessonId/video')
  @ApiOperation({ summary: 'Upload video for lesson' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Video uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @Param('lessonId') lessonId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500 * 1024 * 1024 }), // 500MB
          new FileTypeValidator({ fileType: 'video/*' }),
        ],
      }),
    )
    file: any, // Multer file type
  ) {
    // Forward the file buffer to the course service
    // Note: In a real microservice, you might want to upload directly from gateway
    // or use a message broker that supports binary data

    // For now, we'll handle upload in the gateway and send metadata
    // This is a simplified approach - production might use presigned URLs
    return {
      message: 'Video upload endpoint - implement upload logic here',
      lessonId,
      fileName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  @Get('lessons/:lessonId/video-url')
  @ApiOperation({ summary: 'Get presigned video URL' })
  @ApiResponse({
    status: 200,
    description: 'Returns presigned URL for video access',
  })
  async getVideoUrl(@Param('lessonId') lessonId: string) {
    return firstValueFrom(
      this.courseClient.send('course.admin.lesson.video-url', { lessonId }),
    );
  }
}
