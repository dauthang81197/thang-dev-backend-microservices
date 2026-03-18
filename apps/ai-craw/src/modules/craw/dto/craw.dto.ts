import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CrawUrlDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl({}, { message: 'url must be a valid URL' })
  url!: string;
}
