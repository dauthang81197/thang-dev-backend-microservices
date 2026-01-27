import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Inject,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('courses')
@ApiTags('courses')
export class CourseGatewayController {
  constructor(@Inject('COURSE_SERVICE') private courseClient: ClientProxy) {}

  /**
   * GET /courses
   * Public endpoint to list all published courses with filters
   */
  @Get()
  @ApiOperation({ summary: 'Get all courses with filters and pagination' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    description:
      'Filter by level (beginner, intermediate, advanced, all_levels)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in title, description, and tags',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of courses retrieved successfully',
  })
  async getCourses(@Query() query: any) {
    return this.courseClient.send('courses.findAll', query);
  }

  /**
   * GET /courses/enrolled
   * Get courses that the current user has enrolled in
   */
  @Get('enrolled')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enrolled courses for current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of enrolled courses retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async getEnrolledCourses(@Request() req: any) {
    return this.courseClient.send('courses.findEnrolled', {
      userId: req.user.id,
    });
  }

  /**
   * GET /courses/:id
   * Get detailed information about a specific course
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get course details by ID' })
  @ApiParam({ name: 'id', description: 'Course ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course details retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  async getCourse(@Param('id') id: string) {
    return this.courseClient.send('courses.findOne', { id });
  }

  /**
   * POST /courses/:id/enroll
   * Enroll the current user in a course
   */
  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enroll current user in a course' })
  @ApiParam({ name: 'id', description: 'Course ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully enrolled in the course',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Already enrolled in this course',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async enrollInCourse(@Param('id') courseId: string, @Request() req: any) {
    return this.courseClient.send('courses.enroll', {
      courseId,
      userId: req.user.id,
    });
  }

  /**
   * GET /courses/:id/progress
   * Get the current user's progress in a course
   */
  @Get(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course progress for current user' })
  @ApiParam({ name: 'id', description: 'Course ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Progress retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Must be enrolled to view progress',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async getCourseProgress(@Param('id') courseId: string, @Request() req: any) {
    return this.courseClient.send('courses.getProgress', {
      courseId,
      userId: req.user.id,
    });
  }
}
