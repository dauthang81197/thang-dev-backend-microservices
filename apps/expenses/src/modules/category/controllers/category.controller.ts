import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoryService } from '../category.service';

@Controller()
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @MessagePattern('expenses.categories.create')
    async create(@Payload() data: { userId: string; dto: any }) {
        return this.categoryService.create(data.userId, data.dto);
    }

    @MessagePattern('expenses.categories.findAll')
    async findAll(@Payload() data: { userId: string; type?: string }) {
        return this.categoryService.findAllByUser(data.userId, data.type);
    }

    @MessagePattern('expenses.categories.findOne')
    async findOne(@Payload() data: { id: string; userId: string }) {
        return this.categoryService.findOneByUser(data.id, data.userId);
    }

    @MessagePattern('expenses.categories.update')
    async update(@Payload() data: { id: string; userId: string; dto: any }) {
        return this.categoryService.update(data.id, data.userId, data.dto);
    }

    @MessagePattern('expenses.categories.delete')
    async delete(@Payload() data: { id: string; userId: string }) {
        return this.categoryService.delete(data.id, data.userId);
    }

    @MessagePattern('expenses.categories.withStats')
    async getCategoriesWithStats(
        @Payload() data: { userId: string; type?: string },
    ) {
        return this.categoryService.getCategoriesWithStats(data.userId, data.type);
    }
}
