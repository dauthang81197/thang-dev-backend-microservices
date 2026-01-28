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
  BadRequestException,
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
import { R2StorageService } from '../../services/r2-storage.service';
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
    private readonly r2StorageService: R2StorageService,
  ) {}

  // ============ COURSE CRUD ============

  @Get()
  @ApiOperation({ summary: 'Get all courses (admin view with all statuses)' })
  @ApiResponse({ status: 200, description: 'List of all courses' })
  async getAllCourses(@Request() req) {
    return firstValueFrom(
      this.courseClient.send('course.admin.findAll', {
        instructorId: req.user.id,
      }),
    );
  }

  @Get(':courseId')
  @ApiOperation({ summary: 'Get course details by ID (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Course details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseById(@Param('courseId') courseId: string) {
    return firstValueFrom(
      this.courseClient.send('course.admin.findOne', { courseId }),
    );
  }

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

  // ============ THUMBNAIL UPLOAD ============

  @Post(':courseId/thumbnail')
  @ApiOperation({ summary: 'Upload thumbnail image for course to R2' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, jpeg, png, webp, gif) - Max 5MB',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Thumbnail uploaded successfully to R2',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        thumbnail: { type: 'string', description: 'R2 public URL' },
        thumbnailKey: { type: 'string', description: 'R2 object key' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or size exceeded',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadThumbnail(
    @Param('courseId') courseId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
        fileIsRequired: true,
      }),
    )
    file: any,
  ) {
    // Manual validation for image types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: jpg, jpeg, png, webp, gif`,
      );
    }

    // Upload directly to R2 from API Gateway
    const thumbnailKey = await this.r2StorageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'thumbnails',
    );

    // Get public URL
    const thumbnailUrl = this.r2StorageService.getPublicUrl(thumbnailKey);

    // Update course with thumbnail URL and key
    const result = await firstValueFrom(
      this.courseClient.send('course.admin.update-thumbnail', {
        courseId,
        thumbnail: thumbnailUrl,
        thumbnailKey,
      }),
    );

    return {
      ...result,
      message: 'Thumbnail uploaded successfully to R2 Cloud Storage',
    };
  }

  // ============ VIDEO UPLOAD ============

  @Post('lessons/:lessonId/video/check')
  @ApiOperation({ summary: 'Check file info (debug)' })
  @UseInterceptors(FileInterceptor('file'))
  async checkFile(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: any,
  ) {
    return {
      lessonId,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
    };
  }

  @Post('lessons/:lessonId/video')
  @ApiOperation({ summary: 'Upload video for lesson to R2 Cloud Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Video file (mp4, webm, ogg, mov) - Max 500MB',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Video uploaded successfully to R2',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        videoKey: { type: 'string', description: 'R2 object key' },
        videoSize: { type: 'number' },
        videoFormat: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or size exceeded',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @Param('lessonId') lessonId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500 * 1024 * 1024 }), // 500MB
        ],
        fileIsRequired: true,
      }),
    )
    file: any,
  ) {
    // Manual validation for video types
    const allowedMimeTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo', // AVI
      'video/x-matroska', // MKV
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: mp4, webm, ogg, mov, avi, mkv`,
      );
    }

    // Upload directly to R2 from API Gateway (faster than sending through Redis)
    const videoKey = await this.r2StorageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'videos',
    );

    // Only send metadata to course microservice to update database
    const result = await firstValueFrom(
      this.courseClient.send('course.admin.lesson.video-metadata', {
        lessonId,
        videoKey,
        videoSize: file.size,
        videoFormat: file.mimetype.split('/')[1],
      }),
    );

    return {
      ...result,
      message: 'Video uploaded successfully to R2 Cloud Storage',
    };
  }

  @Get('lessons/:lessonId/video-url')
  @ApiOperation({
    summary: 'Get presigned video URL from R2 (expires in 1 hour)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns presigned URL for video access from R2',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Presigned URL valid for 1 hour',
        },
        lessonId: { type: 'string' },
        expiresIn: {
          type: 'number',
          description: 'Expiration time in seconds',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found or no video available',
  })
  async getVideoUrl(@Param('lessonId') lessonId: string) {
    const url = await firstValueFrom(
      this.courseClient.send('course.admin.lesson.video-url', { lessonId }),
    );

    return {
      url,
      lessonId,
      expiresIn: 3600, // 1 hour
    };
  }
}
