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

@Controller('flower/wallets')
@ApiTags('flower - wallets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletGatewayController {
  constructor(
    @Inject('FLOWER_SERVICE') private flowerClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Wallet created' })
  async create(@Body() dto: any, @Request() req: any) {
    return this.flowerClient.send('flower.wallets.create', {
      userId: req.user.id,
      dto,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all wallets for current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of wallets' })
  async findAll(@Request() req: any) {
    return this.flowerClient.send('flower.wallets.findAll', {
      userId: req.user.id,
    });
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get wallet summary (assets, liabilities, net worth)',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wallet summary' })
  async getSummary(@Request() req: any) {
    return this.flowerClient.send('flower.wallets.summary', {
      userId: req.user.id,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a wallet by ID' })
  @ApiParam({ name: 'id', description: 'Wallet ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wallet details' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wallet not found',
  })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.flowerClient.send('flower.wallets.findOne', {
      id,
      userId: req.user.id,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wallet updated' })
  async update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.flowerClient.send('flower.wallets.update', {
      id,
      userId: req.user.id,
      dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wallet deleted' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.flowerClient.send('flower.wallets.delete', {
      id,
      userId: req.user.id,
    });
  }
}
