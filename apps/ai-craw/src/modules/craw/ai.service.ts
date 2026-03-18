import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ENVIRONMENT } from '../../env/environment';

export interface AiProcessedContent {
  title: string;
  topic: string;
  summary: string;
  keyPoints: string[];
  content: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async processContent(rawContent: string): Promise<AiProcessedContent> {
    const url = ENVIRONMENT.openClaw.url;
    const token = ENVIRONMENT.openClaw.token;

    this.logger.log(`[AiService] Sending content to OpenClaw API: ${url}`);

    const prompt = `Extract title, topic, summary, key points and clean content. Return JSON only.\n\nContent:\n${rawContent}`;

    try {
      const response = await axios.post(
        `${url}/chat/completions`,
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        },
      );

      const raw = response.data?.choices?.[0]?.message?.content || '{}';
      this.logger.log(`[AiService] Raw AI response: ${raw}`);

      const parsed = this.safeParseJson(raw);

      return {
        title: parsed.title || '',
        topic: parsed.topic || '',
        summary: parsed.summary || '',
        keyPoints: Array.isArray(parsed.key_points)
          ? parsed.key_points
          : Array.isArray(parsed.keyPoints)
            ? parsed.keyPoints
            : [],
        content: parsed.content || rawContent,
      };
    } catch (error: any) {
      this.logger.error(
        `[AiService] Failed to process content: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private safeParseJson(raw: string): Record<string, any> {
    try {
      // Strip markdown code fences if present
      const cleaned = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      return JSON.parse(cleaned);
    } catch {
      this.logger.warn(
        '[AiService] Failed to parse JSON response, returning empty object',
      );
      return {};
    }
  }
}
