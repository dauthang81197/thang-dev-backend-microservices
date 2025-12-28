import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterOrganizationDto {
  @ApiProperty({
    example: 'My Organization',
    description: 'Organization name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'ORG001',
    description: 'Organization code',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    example: 'This is a description of the organization',
    description: 'Organization description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '123 Main Street, City, Country',
    description: 'Organization address',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'Additional content about the organization',
    description: 'Organization content',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    example: 'Vietnam',
    description: 'Organization country',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    example: 'https://www.example.com',
    description: 'Organization website',
    required: false,
  })
  @IsOptional()
  @IsString()
  website?: string;
}
