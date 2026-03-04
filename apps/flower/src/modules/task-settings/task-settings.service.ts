import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskSettingsEntity } from '../../shareds/entities/flower/task-settings.entity';
import { UpdateTaskSettingsDto } from './dto/task-settings.dto';

@Injectable()
export class TaskSettingsService {
  private readonly logger = new Logger(TaskSettingsService.name);

  constructor(
    @InjectRepository(TaskSettingsEntity)
    private readonly settingsRepository: Repository<TaskSettingsEntity>,
  ) {}

  async getSettings(userId: string): Promise<TaskSettingsEntity> {
    let settings = await this.settingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      // Create default settings
      settings = this.settingsRepository.create({ userId });
      settings = await this.settingsRepository.save(settings);
    }

    return settings;
  }

  async updateSettings(
    userId: string,
    dto: UpdateTaskSettingsDto,
  ): Promise<TaskSettingsEntity> {
    let settings = await this.settingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = this.settingsRepository.create({ userId, ...dto });
    } else {
      Object.assign(settings, dto);
    }

    return this.settingsRepository.save(settings);
  }
}
