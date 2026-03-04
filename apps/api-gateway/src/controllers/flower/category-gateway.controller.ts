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

@Controller('flower/categories')
@ApiTags('flower - categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoryGatewayController {
  constructor(@Inject('FLOWER_SERVICE') private flowerClient: ClientProxy) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Category created' })
  async create(@Body() dto: any, @Request() req: any) {
    return this.flowerClient.send('flower.categories.create', {
      userId: req.user.id,
      dto,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories for current user' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by INCOME or EXPENSE',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of categories' })
  async findAll(@Query('type') type: string, @Request() req: any) {
    return this.flowerClient.send('flower.categories.findAll', {
      userId: req.user.id,
      type,
    });
  }

  @Get('with-stats')
  @ApiOperation({ summary: 'Get categories with transaction stats' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by INCOME or EXPENSE',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories with transaction counts and totals',
  })
  async getCategoriesWithStats(
    @Query('type') type: string,
    @Request() req: any,
  ) {
    return this.flowerClient.send('flower.categories.withStats', {
      userId: req.user.id,
      type,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category updated' })
  async update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.flowerClient.send('flower.categories.update', {
      id,
      userId: req.user.id,
      dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category deleted' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.flowerClient.send('flower.categories.delete', {
      id,
      userId: req.user.id,
    });
  }
}
