import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { RpcException } from '@nestjs/microservices';
import { CrawArticleEntity } from '../../shareds/entities/ai-craw/craw-article.entity';
import { AiService } from './ai.service';

@Injectable()
export class CrawService {
  private readonly logger = new Logger(CrawService.name);

  constructor(
    @InjectRepository(CrawArticleEntity)
    private readonly crawArticleRepository: Repository<CrawArticleEntity>,
    private readonly aiService: AiService,
  ) {}

  async crawlUrl(url: string): Promise<string> {
    this.logger.log(`[CrawService] Fetching URL: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; AiCrawBot/1.0; +https://example.com/bot)',
        },
        timeout: 30000,
      });

      const html: string = response.data;
      const $ = cheerio.load(html);

      // Remove noise elements
      $(
        'script, style, nav, footer, header, aside, noscript, iframe, form',
      ).remove();
      $(
        '[class*="menu"], [class*="sidebar"], [class*="advertisement"], [class*="ad-"], [id*="ad-"]',
      ).remove();

      // Extract paragraphs
      const paragraphs: string[] = [];
      $('p, h1, h2, h3, h4, h5, h6, li, blockquote').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 20) {
          paragraphs.push(text);
        }
      });

      const rawContent = paragraphs.join('\n\n');
      this.logger.log(
        `[CrawService] Extracted ${paragraphs.length} text blocks from ${url}`,
      );

      return rawContent;
    } catch (error: any) {
      this.logger.error(
        `[CrawService] Failed to fetch URL ${url}: ${error.message}`,
        error.stack,
      );
      throw new RpcException(`Failed to fetch URL: ${error.message}`);
    }
  }

  async crawlAndSave(url: string): Promise<CrawArticleEntity> {
    this.logger.log(`[CrawService] Starting crawlAndSave for: ${url}`);

    // Step 1: Fetch and parse HTML
    const rawContent = await this.crawlUrl(url);

    if (!rawContent || rawContent.trim().length === 0) {
      throw new RpcException('No content extracted from the provided URL');
    }

    // Step 2: Send to AI for processing
    this.logger.log(`[CrawService] Sending content to AI service`);
    const processed = await this.aiService.processContent(rawContent);

    // Step 3: Save to database
    this.logger.log(`[CrawService] Saving article to database`);
    const article = this.crawArticleRepository.create({
      url,
      title: processed.title,
      topic: processed.topic,
      summary: processed.summary,
      content: processed.content,
      keyPoints: processed.keyPoints,
    });

    const saved = await this.crawArticleRepository.save(article);
    this.logger.log(`[CrawService] Article saved with id: ${saved.id}`);

    return saved;
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.crawArticleRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<CrawArticleEntity> {
    const article = await this.crawArticleRepository.findOne({ where: { id } });
    if (!article) {
      throw new RpcException(`Article with id ${id} not found`);
    }
    return article;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const article = await this.findOne(id);
    await this.crawArticleRepository.remove(article);
    return { success: true };
  }
}
