import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Max, Min } from 'class-validator';

export class QueryPaginationDto {
  @ApiProperty({
    type: Number,
    required: false,
    description: 'Default page 1. Min is 1',
  })
  @Optional()
  @Transform(({ value }) => Number(value))
  @Min(1, {
    message: 'common.MIN_PAGE',
  })
  page = 1;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Default limit 10 rows. Min is 1 and max is 100',
  })
  @Optional()
  @Transform(({ value }) => Number(value))
  @Min(1, {
    message: 'common.LIMIT_PER_PAGE_MIN',
  })
  @Max(100, {
    message: 'common.LIMIT_PER_PAGE_MAX',
  })
  limit = 10;
}
