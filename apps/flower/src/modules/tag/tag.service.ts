import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagEntity } from '../../shareds/entities/flower/tag.entity';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  async create(userId: string, dto: CreateTagDto): Promise<TagEntity> {
    // Check duplicate name
    const existing = await this.tagRepository.findOne({
      where: { userId, name: dto.name },
    });
    if (existing) {
      throw new RpcException({
        statusCode: 409,
        message: `Tag "${dto.name}" already exists`,
      });
    }

    const tag = this.tagRepository.create({
      userId,
      name: dto.name,
      color: dto.color,
    });
    return this.tagRepository.save(tag);
  }

  async findAllByUser(userId: string): Promise<any[]> {
    const tags = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.tasks', 'task')
      .addSelect('COUNT(task.id)', 'taskCount')
      .where('tag.userId = :userId', { userId })
      .groupBy('tag.id')
      .getRawAndEntities();

    return tags.entities.map((tag, index) => ({
      ...tag,
      taskCount: Number(tags.raw[index]?.taskCount || 0),
    }));
  }

  async findOne(id: string, userId: string): Promise<TagEntity> {
    const tag = await this.tagRepository.findOne({
      where: { id, userId },
    });
    if (!tag) {
      throw new RpcException({ statusCode: 404, message: 'Tag not found' });
    }
    return tag;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateTagDto,
  ): Promise<TagEntity> {
    const tag = await this.findOne(id, userId);

    if (dto.name && dto.name !== tag.name) {
      const existing = await this.tagRepository.findOne({
        where: { userId, name: dto.name },
      });
      if (existing) {
        throw new RpcException({
          statusCode: 409,
          message: `Tag "${dto.name}" already exists`,
        });
      }
    }

    Object.assign(tag, dto);
    return this.tagRepository.save(tag);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const tag = await this.findOne(id, userId);
    await this.tagRepository.remove(tag);
    return { message: 'Tag deleted successfully' };
  }
}
