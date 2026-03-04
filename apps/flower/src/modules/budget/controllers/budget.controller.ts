import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BudgetService } from '../budget.service';

@Controller()
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @MessagePattern('flower.budgets.create')
  async create(@Payload() data: { userId: string; dto: any }) {
    return this.budgetService.create(data.userId, data.dto);
  }

  @MessagePattern('flower.budgets.findByMonth')
  async findByMonth(
    @Payload() data: { userId: string; month: number; year: number },
  ) {
    return this.budgetService.findByMonthYear(
      data.userId,
      data.month,
      data.year,
    );
  }

  @MessagePattern('flower.budgets.update')
  async update(@Payload() data: { id: string; userId: string; dto: any }) {
    return this.budgetService.update(data.id, data.userId, data.dto);
  }

  @MessagePattern('flower.budgets.delete')
  async delete(@Payload() data: { id: string; userId: string }) {
    return this.budgetService.delete(data.id, data.userId);
  }
}
