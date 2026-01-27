import {
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsUUID()
  courseId: string;
}

export class UpdateSectionDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}
