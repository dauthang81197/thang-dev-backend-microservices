import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TagService } from '../tag.service';

@Controller()
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @MessagePattern('flower.tags.create')
  async create(@Payload() data: { userId: string; dto: any }) {
    return this.tagService.create(data.userId, data.dto);
  }

  @MessagePattern('flower.tags.findAll')
  async findAll(@Payload() data: { userId: string }) {
    return this.tagService.findAllByUser(data.userId);
  }

  @MessagePattern('flower.tags.findOne')
  async findOne(@Payload() data: { id: string; userId: string }) {
    return this.tagService.findOne(data.id, data.userId);
  }

  @MessagePattern('flower.tags.update')
  async update(@Payload() data: { id: string; userId: string; dto: any }) {
    return this.tagService.update(data.id, data.userId, data.dto);
  }

  @MessagePattern('flower.tags.delete')
  async delete(@Payload() data: { id: string; userId: string }) {
    return this.tagService.delete(data.id, data.userId);
  }
}
