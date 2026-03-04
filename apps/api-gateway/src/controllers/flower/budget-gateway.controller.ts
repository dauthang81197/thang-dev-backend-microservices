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

@Controller('flower/budgets')
@ApiTags('flower - budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetGatewayController {
  constructor(@Inject('FLOWER_SERVICE') private flowerClient: ClientProxy) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Budget created' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Budget already exists for this category/month/year',
  })
  async create(@Body() dto: any, @Request() req: any) {
    console.log();
    return this.flowerClient.send('flower.budgets.create', {
      userId: req.user.id,
      dto,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Get budgets for a specific month/year with spent amounts',
  })
  @ApiQuery({
    name: 'month',
    required: true,
    type: Number,
    description: 'Month (1-12)',
  })
  @ApiQuery({ name: 'year', required: true, type: Number, description: 'Year' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Budgets with spending progress',
  })
  async findByMonth(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req: any,
  ) {
    return this.flowerClient.send('flower.budgets.findByMonth', {
      userId: req.user.id,
      month: Number(month),
      year: Number(year),
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget amount' })
  @ApiParam({ name: 'id', description: 'Budget ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Budget updated' })
  async update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.flowerClient.send('flower.budgets.update', {
      id,
      userId: req.user.id,
      dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiParam({ name: 'id', description: 'Budget ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Budget deleted' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.flowerClient.send('flower.budgets.delete', {
      id,
      userId: req.user.id,
    });
  }
}
