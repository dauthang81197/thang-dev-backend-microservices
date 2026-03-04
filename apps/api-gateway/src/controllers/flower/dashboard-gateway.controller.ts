import {
  Controller,
  Get,
  Query,
  Inject,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('flower/dashboard')
@ApiTags('flower - dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardGatewayController {
  constructor(@Inject('FLOWER_SERVICE') private flowerClient: ClientProxy) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get expense dashboard overview' })
  @ApiQuery({
    name: 'month',
    required: true,
    type: Number,
    description: 'Month (1-12)',
  })
  @ApiQuery({ name: 'year', required: true, type: Number, description: 'Year' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Dashboard overview with totals, charts, and recent transactions',
  })
  async getOverview(
    @Query('month') month: number,
    @Query('year') year: number,
    @Request() req: any,
  ) {
    return this.flowerClient.send('flower.dashboard.overview', {
      userId: req.user.id,
      month: Number(month),
      year: Number(year),
    });
  }
}
