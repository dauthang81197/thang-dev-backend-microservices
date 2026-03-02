import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DashboardService } from '../dashboard.service';

@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @MessagePattern('expenses.dashboard.overview')
  async getOverview(
    @Payload() data: { userId: string; month: number; year: number },
  ) {
    return this.dashboardService.getOverview(
      data.userId,
      data.month,
      data.year,
    );
  }
}
