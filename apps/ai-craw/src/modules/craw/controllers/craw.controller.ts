import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CrawService } from '../craw.service';
import { CrawUrlDto } from '../dto/craw.dto';

@Controller()
export class CrawController {
  private readonly logger = new Logger(CrawController.name);

  constructor(private readonly crawService: CrawService) {}

  @MessagePattern('ai-craw.crawl')
  async crawl(@Payload() dto: CrawUrlDto) {
    this.logger.log(`[CrawController] Received crawl request for: ${dto.url}`);
    return this.crawService.crawlAndSave(dto.url);
  }

  @MessagePattern('ai-craw.articles.findAll')
  async findAll(@Payload() data: { page?: number; limit?: number }) {
    return this.crawService.findAll(data.page, data.limit);
  }

  @MessagePattern('ai-craw.articles.findOne')
  async findOne(@Payload() data: { id: string }) {
    return this.crawService.findOne(data.id);
  }

  @MessagePattern('ai-craw.articles.delete')
  async delete(@Payload() data: { id: string }) {
    return this.crawService.delete(data.id);
  }
}
