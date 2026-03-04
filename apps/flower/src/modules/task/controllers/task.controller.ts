import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TaskService } from '../task.service';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @MessagePattern('flower.tasks.create')
  async create(@Payload() data: { userId: string; dto: any }) {
    return this.taskService.create(data.userId, data.dto);
  }

  @MessagePattern('flower.tasks.findAll')
  async findAll(@Payload() data: { userId: string; filter: any }) {
    return this.taskService.findAll(data.userId, data.filter);
  }

  @MessagePattern('flower.tasks.findOne')
  async findOne(@Payload() data: { id: string; userId: string }) {
    return this.taskService.findOne(data.id, data.userId);
  }

  @MessagePattern('flower.tasks.update')
  async update(@Payload() data: { id: string; userId: string; dto: any }) {
    return this.taskService.update(data.id, data.userId, data.dto);
  }

  @MessagePattern('flower.tasks.delete')
  async delete(@Payload() data: { id: string; userId: string }) {
    return this.taskService.delete(data.id, data.userId);
  }

  @MessagePattern('flower.tasks.today')
  async getTodayTasks(@Payload() data: { userId: string }) {
    return this.taskService.getTodayTasks(data.userId);
  }

  @MessagePattern('flower.tasks.dashboard')
  async getDashboard(@Payload() data: { userId: string }) {
    return this.taskService.getDashboard(data.userId);
  }
}
