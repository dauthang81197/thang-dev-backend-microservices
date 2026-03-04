import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import {
  TaskEntity,
  TaskStatus,
  TaskPriority,
} from '../../shareds/entities/flower/task.entity';
import { TagEntity } from '../../shareds/entities/flower/tag.entity';
import { CreateTaskDto, UpdateTaskDto, FilterTaskDto } from './dto/task.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  async create(userId: string, dto: CreateTaskDto): Promise<TaskEntity> {
    const task = this.taskRepository.create({
      userId,
      title: dto.title,
      description: dto.description,
      status: dto.status || TaskStatus.TODO,
      priority: dto.priority || TaskPriority.MEDIUM,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      estimatedMinutes: dto.estimatedMinutes,
    });

    if (dto.tagIds && dto.tagIds.length > 0) {
      task.tags = await this.tagRepository.find({
        where: { id: In(dto.tagIds), userId },
      });
    }

    return this.taskRepository.save(task);
  }

  async findAll(userId: string, filter: FilterTaskDto) {
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.tags', 'tag')
      .where('task.userId = :userId', { userId });

    if (filter.search) {
      qb.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    if (filter.status) {
      qb.andWhere('task.status = :status', { status: filter.status });
    }

    if (filter.priority) {
      qb.andWhere('task.priority = :priority', { priority: filter.priority });
    }

    if (filter.tagId) {
      qb.andWhere('tag.id = :tagId', { tagId: filter.tagId });
    }

    qb.orderBy('task.dueDate', 'ASC', 'NULLS LAST').addOrderBy(
      'task.createdAt',
      'DESC',
    );

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();

    // Auto-mark overdue
    const now = new Date();
    for (const task of items) {
      if (
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== TaskStatus.DONE &&
        task.status !== TaskStatus.OVERDUE
      ) {
        task.status = TaskStatus.OVERDUE;
      }
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id, userId },
      relations: ['tags'],
    });
    if (!task) {
      throw new RpcException({ statusCode: 404, message: 'Task not found' });
    }
    return task;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskEntity> {
    const task = await this.findOne(id, userId);

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.dueDate !== undefined) task.dueDate = new Date(dto.dueDate);
    if (dto.estimatedMinutes !== undefined)
      task.estimatedMinutes = dto.estimatedMinutes;

    if (dto.tagIds !== undefined) {
      if (dto.tagIds.length > 0) {
        task.tags = await this.tagRepository.find({
          where: { id: In(dto.tagIds), userId },
        });
      } else {
        task.tags = [];
      }
    }

    return this.taskRepository.save(task);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);
    return { message: 'Task deleted successfully' };
  }

  async getTodayTasks(userId: string) {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const tasks = await this.taskRepository.find({
      where: {
        userId,
        dueDate: Between(startOfDay, endOfDay),
      },
      relations: ['tags'],
      order: { priority: 'ASC', createdAt: 'ASC' },
    });

    // Auto-mark overdue
    for (const task of tasks) {
      if (
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== TaskStatus.DONE &&
        task.status !== TaskStatus.OVERDUE
      ) {
        task.status = TaskStatus.OVERDUE;
      }
    }

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === TaskStatus.DONE).length;
    const totalEstimatedMinutes = tasks.reduce(
      (sum, t) => sum + (t.estimatedMinutes || 0),
      0,
    );
    const remainingMinutes = tasks
      .filter((t) => t.status !== TaskStatus.DONE)
      .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

    return {
      date: startOfDay.toISOString(),
      stats: {
        total,
        completed,
        totalEstimatedMinutes,
        remainingMinutes,
      },
      tasks,
    };
  }

  async getDashboard(userId: string) {
    const now = new Date();

    // All tasks for user
    const allTasks = await this.taskRepository.find({
      where: { userId },
      relations: ['tags'],
    });

    // Auto-mark overdue
    for (const task of allTasks) {
      if (
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== TaskStatus.DONE &&
        task.status !== TaskStatus.OVERDUE
      ) {
        task.status = TaskStatus.OVERDUE;
        await this.taskRepository.save(task);
      }
    }

    const total = allTasks.length;
    const todo = allTasks.filter((t) => t.status === TaskStatus.TODO).length;
    const inProgress = allTasks.filter(
      (t) => t.status === TaskStatus.IN_PROGRESS,
    ).length;
    const done = allTasks.filter((t) => t.status === TaskStatus.DONE).length;
    const overdue = allTasks.filter(
      (t) => t.status === TaskStatus.OVERDUE,
    ).length;

    // Completion rate
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    const totalEstimatedMinutes = allTasks.reduce(
      (sum, t) => sum + (t.estimatedMinutes || 0),
      0,
    );

    // Today's tasks count
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );
    const todayTasks = allTasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) >= startOfDay &&
        new Date(t.dueDate) <= endOfDay,
    ).length;

    // Priority breakdown
    const highCount = allTasks.filter(
      (t) => t.priority === TaskPriority.HIGH,
    ).length;
    const mediumCount = allTasks.filter(
      (t) => t.priority === TaskPriority.MEDIUM,
    ).length;
    const lowCount = allTasks.filter(
      (t) => t.priority === TaskPriority.LOW,
    ).length;

    // Upcoming deadlines (tasks not done, with due date, sorted by date)
    const upcomingDeadlines = allTasks
      .filter((t) => t.dueDate && t.status !== TaskStatus.DONE)
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      )
      .slice(0, 10);

    // Tags overview
    const tagMap = new Map<
      string,
      { name: string; color: string; count: number }
    >();
    for (const task of allTasks) {
      if (task.tags) {
        for (const tag of task.tags) {
          const existing = tagMap.get(tag.id);
          if (existing) {
            existing.count++;
          } else {
            tagMap.set(tag.id, {
              name: tag.name,
              color: tag.color,
              count: 1,
            });
          }
        }
      }
    }

    return {
      stats: {
        total,
        todo,
        inProgress,
        done,
        overdue,
      },
      completionRate: {
        percentage: completionRate,
        completed: done,
        total,
        totalEstimatedMinutes,
        todayTasks,
      },
      priorityBreakdown: {
        high: {
          count: highCount,
          percentage: total > 0 ? Math.round((highCount / total) * 100) : 0,
        },
        medium: {
          count: mediumCount,
          percentage: total > 0 ? Math.round((mediumCount / total) * 100) : 0,
        },
        low: {
          count: lowCount,
          percentage: total > 0 ? Math.round((lowCount / total) * 100) : 0,
        },
      },
      upcomingDeadlines,
      tagsOverview: Array.from(tagMap.values()),
    };
  }
}
