import {
  Controller,
  Get,
  Patch,
  Body,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('flower/task-settings')
@ApiTags('flower - task settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TaskSettingsGatewayController {
  constructor(@Inject('FLOWER_SERVICE') private flowerClient: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Get task settings for current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task settings (creates defaults if not exists)',
  })
  async getSettings(@Request() req: any) {
    return this.flowerClient.send('flower.taskSettings.get', {
      userId: req.user.id,
    });
  }

  @Patch()
  @ApiOperation({ summary: 'Update task settings' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Task settings updated' })
  async updateSettings(@Body() dto: any, @Request() req: any) {
    return this.flowerClient.send('flower.taskSettings.update', {
      userId: req.user.id,
      dto,
    });
  }
}
