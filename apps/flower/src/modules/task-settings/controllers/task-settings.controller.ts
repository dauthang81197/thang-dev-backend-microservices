import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TaskSettingsService } from '../task-settings.service';

@Controller()
export class TaskSettingsController {
  constructor(private readonly taskSettingsService: TaskSettingsService) {}

  @MessagePattern('flower.taskSettings.get')
  async getSettings(@Payload() data: { userId: string }) {
    return this.taskSettingsService.getSettings(data.userId);
  }

  @MessagePattern('flower.taskSettings.update')
  async updateSettings(@Payload() data: { userId: string; dto: any }) {
    return this.taskSettingsService.updateSettings(data.userId, data.dto);
  }
}
