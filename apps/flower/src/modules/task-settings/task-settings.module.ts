import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskSettingsEntity } from '../../shareds/entities/flower/task-settings.entity';
import { TaskSettingsService } from './task-settings.service';
import { TaskSettingsController } from './controllers/task-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaskSettingsEntity])],
  controllers: [TaskSettingsController],
  providers: [TaskSettingsService],
  exports: [TaskSettingsService],
})
export class TaskSettingsModule {}
