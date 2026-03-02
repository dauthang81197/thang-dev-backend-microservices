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

@Controller('expenses/transactions')
@ApiTags('expenses - transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionGatewayController {
  constructor(
    @Inject('EXPENSES_SERVICE') private expensesClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transaction created. Wallet balance updated.',
  })
  async create(@Body() dto: any, @Request() req: any) {
    return this.expensesClient.send('expenses.transactions.create', {
      userId: req.user.id,
      dto,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions with filters and pagination' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by INCOME or EXPENSE',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'walletId',
    required: false,
    description: 'Filter by wallet ID',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    description: 'From date (ISO)',
  })
  @ApiQuery({ name: 'toDate', required: false, description: 'To date (ISO)' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in description',
  })
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
    description: 'Paginated list of transactions',
  })
  async findAll(@Query() query: any, @Request() req: any) {
    return this.expensesClient.send('expenses.transactions.findAll', {
      userId: req.user.id,
      filter: query,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID (UUID)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Transaction details' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transaction not found',
  })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.expensesClient.send('expenses.transactions.findOne', {
      id,
      userId: req.user.id,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction updated. Wallet balance adjusted.',
  })
  async update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.expensesClient.send('expenses.transactions.update', {
      id,
      userId: req.user.id,
      dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction deleted. Wallet balance reversed.',
  })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.expensesClient.send('expenses.transactions.delete', {
      id,
      userId: req.user.id,
    });
  }
}
