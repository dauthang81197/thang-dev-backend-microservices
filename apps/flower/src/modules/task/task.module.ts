import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from '../../shareds/entities/flower/task.entity';
import { TagEntity } from '../../shareds/entities/flower/tag.entity';
import { TaskService } from './task.service';
import { TaskController } from './controllers/task.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, TagEntity])],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
