// Load .env file FIRST before any imports
import * as dotenv from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
console.log('[Flower Service] Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('[Flower Service] Failed to load .env:', result.error.message);
} else {
  console.log('[Flower Service] .env loaded successfully');
}

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { FlowerModule } from './flower.module';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { ENVIRONMENT } from './env/environment';
import { LoggingInterceptor } from '@app/common';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FlowerModule,
    {
      transport: Transport.REDIS,
      options: {
        host: ENVIRONMENT.redis.host || 'localhost',
        port: Number(ENVIRONMENT.redis.port) || 6379,
        retryAttempts: 5,
        retryDelay: 3000,
        connectTimeout: 10000,
        keepAlive: 30000,
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
        lazyConnect: false,
        enableOfflineQueue: true,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
      },
    },
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen();

  console.log('[Flower Service] Microservice is running');
  console.log(
    '[Flower Service] Environment:',
    process.env.NODE_ENV || 'development',
  );
  console.log(
    '[Flower Service] Database:',
    `${ENVIRONMENT.database.host}:${ENVIRONMENT.database.port}/${ENVIRONMENT.database.dbName}`,
  );
  console.log(
    '[Flower Service] Redis:',
    `${ENVIRONMENT.redis.host}:${ENVIRONMENT.redis.port}`,
  );
  console.log('[Flower Service] Port:', process.env.PORT || '3004');
}

bootstrap();
