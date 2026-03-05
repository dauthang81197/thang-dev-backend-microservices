// Load .env file FIRST before any imports
import * as dotenv from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
console.log('[Notification Service] Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(
    '[Notification Service] Failed to load .env:',
    result.error.message,
  );
} else {
  console.log('[Notification Service] .env loaded successfully');
}

import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';
import { ENVIRONMENT } from './env/environment';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);

  // This is a standalone app that only runs scheduled jobs — no HTTP server needed
  // but we still start it so NestJS initialises the scheduler
  await app.init();

  console.log('[Notification Service] Service is running');
  console.log(
    '[Notification Service] Environment:',
    process.env.NODE_ENV || 'development',
  );
  console.log(
    '[Notification Service] Database:',
    `${ENVIRONMENT.database.host}:${ENVIRONMENT.database.port}/${ENVIRONMENT.database.dbName}`,
  );
  console.log(
    '[Notification Service] Telegram configured:',
    ENVIRONMENT.telegram.botToken ? 'YES' : 'NO',
  );
}

bootstrap();
