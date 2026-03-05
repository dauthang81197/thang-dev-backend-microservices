import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ENVIRONMENT } from '../../env/environment';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  async sendMessage(message: string): Promise<void> {
    const botToken = ENVIRONMENT.telegram.botToken;
    const chatId = ENVIRONMENT.telegram.chatId;

    if (!botToken || !chatId) {
      this.logger.warn(
        'Telegram bot token or chat ID is not configured, skipping notification',
      );
      return;
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
      await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      });
      this.logger.log('Telegram notification sent successfully');
    } catch (error: any) {
      this.logger.error(
        'Failed to send Telegram notification',
        error?.response?.data || error.message,
      );
    }
  }
}
