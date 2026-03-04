import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TransactionService } from '../transaction.service';

@Controller()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @MessagePattern('flower.transactions.create')
  async create(@Payload() data: { userId: string; dto: any }) {
    return this.transactionService.create(data.userId, data.dto);
  }

  @MessagePattern('flower.transactions.findAll')
  async findAll(@Payload() data: { userId: string; filter: any }) {
    return this.transactionService.findAll(data.userId, data.filter);
  }

  @MessagePattern('flower.transactions.findOne')
  async findOne(@Payload() data: { id: string; userId: string }) {
    return this.transactionService.findOne(data.id, data.userId);
  }

  @MessagePattern('flower.transactions.update')
  async update(@Payload() data: { id: string; userId: string; dto: any }) {
    return this.transactionService.update(data.id, data.userId, data.dto);
  }

  @MessagePattern('flower.transactions.delete')
  async delete(@Payload() data: { id: string; userId: string }) {
    return this.transactionService.delete(data.id, data.userId);
  }
}
