import { IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteLessonDto {
  @ApiPropertyOptional({
    description: 'Video watched duration in seconds',
    example: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  watchedDuration?: number;
}

export class UncompleteLessonDto {
  // No body required - userId from JWT
}
