import { IsEnum, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../../../shareds/entities/flower/task.entity';
import { DefaultView } from '../../../shareds/entities/flower/task-settings.entity';

export class UpdateTaskSettingsDto {
  @ApiPropertyOptional({
    enum: DefaultView,
    example: DefaultView.LIST,
    description: 'Default view mode',
  })
  @IsOptional()
  @IsEnum(DefaultView)
  defaultView?: DefaultView;

  @ApiPropertyOptional({
    example: true,
    description: 'Show completed tasks in list',
  })
  @IsOptional()
  @IsBoolean()
  showCompleted?: boolean;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    description: 'Default priority for new tasks',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  defaultPriority?: TaskPriority;

  @ApiPropertyOptional({
    example: 30,
    description: 'Auto-archive completed tasks after this many days',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  autoArchiveDays?: number;
}
