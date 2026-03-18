import { Module } from '@nestjs/common';
import { CrawModule } from './craw/craw.module';

export const BASE_PLATFORM_IMPORTS = [CrawModule];

@Module({
  imports: [...BASE_PLATFORM_IMPORTS],
  controllers: [],
  providers: [],
})
export class BasePlatformModule {}
