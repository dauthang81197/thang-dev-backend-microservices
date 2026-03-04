import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('flower/tasks')
@ApiTags('flower - tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TaskGatewayController {
  constructor(@Inject('FLOWER_SERVICE') private flowerClient: ClientProxy) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Task created' })
  async create(@Body() dto: any, @Request() req: any) {
    return this.flowerClient.send('flower.tasks.create', {
      userId: req.user.id,
      dto,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with filters and pagination' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in title and description',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status: TODO, IN_PROGRESS, DONE, OVERDUE',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    description: 'Filter by priority: LOW, MEDIUM, HIGH',
  })
  @ApiQuery({ name: 'tagId', required: false, description: 'Filter by tag ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated list of tasks',
  })
  async findAll(@Query() query: any, @Request() req: any) {
    return this.flowerClient.send('flower.tasks.findAll', {
      userId: req.user.id,
      filter: query,
    });
  }

  @Get('today')
  @ApiOperation({ summary: "Get today's tasks with stats" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Today's tasks with completion stats",
  })
  async getTodayTasks(@Request() req: any) {
    return this.flowerClient.send('flower.tasks.today', {
      userId: req.user.id,
    });
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get task dashboard overview' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Dashboard with stats, completion rate, priority breakdown, upcoming deadlines, tags overview',
  })
  async getDashboard(@Request() req: any) {
    return this.flowerClient.send('flower.tasks.dashboard', {
      userId: req.user.id,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Task details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.flowerClient.send('flower.tasks.findOne', {
      id,
      userId: req.user.id,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Task updated' })
  async update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.flowerClient.send('flower.tasks.update', {
      id,
      userId: req.user.id,
      dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Task deleted' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.flowerClient.send('flower.tasks.delete', {
      id,
      userId: req.user.id,
    });
  }
}
