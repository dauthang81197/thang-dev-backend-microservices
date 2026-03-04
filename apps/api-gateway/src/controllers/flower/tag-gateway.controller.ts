import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('flower/tags')
@ApiTags('flower - tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TagGatewayController {
  constructor(@Inject('FLOWER_SERVICE') private flowerClient: ClientProxy) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Tag created' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tag name already exists',
  })
  async create(@Body() dto: any, @Request() req: any) {
    return this.flowerClient.send('flower.tags.create', {
      userId: req.user.id,
      dto,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags with task counts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of tags with task counts',
  })
  async findAll(@Request() req: any) {
    return this.flowerClient.send('flower.tags.findAll', {
      userId: req.user.id,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tag details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tag not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.flowerClient.send('flower.tags.findOne', {
      id,
      userId: req.user.id,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tag updated' })
  async update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.flowerClient.send('flower.tags.update', {
      id,
      userId: req.user.id,
      dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tag deleted' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.flowerClient.send('flower.tags.delete', {
      id,
      userId: req.user.id,
    });
  }
}
