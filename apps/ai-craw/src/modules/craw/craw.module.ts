import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawArticleEntity } from '../../shareds/entities/ai-craw/craw-article.entity';
import { CrawService } from './craw.service';
import { AiService } from './ai.service';
import { CrawController } from './controllers/craw.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CrawArticleEntity])],
  controllers: [CrawController],
  providers: [CrawService, AiService],
  exports: [CrawService],
})
export class CrawModule {}
