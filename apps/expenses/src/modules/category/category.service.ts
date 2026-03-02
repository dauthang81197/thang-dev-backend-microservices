import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../shareds/entities/expenses/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(
    userId: string,
    dto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    const category = this.categoryRepository.create({
      userId,
      name: dto.name,
      type: dto.type,
      icon: dto.icon,
      color: dto.color,
    });
    return this.categoryRepository.save(category);
  }

  async findAllByUser(
    userId: string,
    type?: string,
  ): Promise<CategoryEntity[]> {
    const qb = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.userId = :userId', { userId });

    if (type) {
      qb.andWhere('category.type = :type', { type });
    }

    qb.orderBy('category.name', 'ASC');

    return qb.getMany();
  }

  async findOneByUser(id: string, userId: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
    });
    if (!category) {
      throw new RpcException({
        statusCode: 404,
        message: 'Category not found',
      });
    }
    return category;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    const category = await this.findOneByUser(id, userId);
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const category = await this.findOneByUser(id, userId);
    await this.categoryRepository.remove(category);
    return { message: 'Category deleted successfully' };
  }

  async getCategoriesWithStats(userId: string, type?: string) {
    const qb = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.transactions', 'transaction')
      .select([
        'category.id AS id',
        'category.name AS name',
        'category.type AS type',
        'category.icon AS icon',
        'category.color AS color',
        'COUNT(transaction.id) AS "transactionCount"',
        'COALESCE(SUM(transaction.amount), 0) AS "totalAmount"',
      ])
      .where('category.userId = :userId', { userId })
      .groupBy('category.id');

    if (type) {
      qb.andWhere('category.type = :type', { type });
    }

    qb.orderBy('category.name', 'ASC');

    return qb.getRawMany();
  }
}
