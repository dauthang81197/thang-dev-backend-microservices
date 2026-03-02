// Load .env file FIRST before any imports
import * as dotenv from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
console.log('[Identity Service] Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(
    '[Identity Service] Failed to load .env:',
    result.error.message,
  );
} else {
  console.log('[Identity Service] .env loaded successfully');
  console.log(
    '[Identity Service] JWT_SECRET from process.env:',
    process.env.JWT_SECRET
      ? `${process.env.JWT_SECRET.substring(0, 5)}***`
      : 'UNDEFINED',
  );
}

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IdentityModule } from './identity.module';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { ENVIRONMENT } from './env/environment';
import { LoggingInterceptor } from '@app/common';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    IdentityModule,
    {
      transport: Transport.REDIS,
      options: {
        host: ENVIRONMENT.redis.host || 'localhost',
        port: Number(ENVIRONMENT.redis.port) || 6379,
        retryAttempts: 5,
        retryDelay: 3000,
        // Redis connection options
        connectTimeout: 10000,
        keepAlive: 30000,
        // Reconnection strategy
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true; // reconnect on readonly error
          }
          return false;
        },
        // Add retry strategy
        lazyConnect: false,
        enableOfflineQueue: true,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
      },
    },
  );

  // Global Logging Interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen();

  console.log('[Identity Service] Microservice is running');
  console.log(
    '[Identity Service] Environment:',
    process.env.NODE_ENV || 'development',
  );
  console.log(
    '[Identity Service] Database:',
    `${ENVIRONMENT.database.host}:${ENVIRONMENT.database.port}/${ENVIRONMENT.database.dbName}`,
  );
  console.log(
    '[Identity Service] Redis:',
    `${ENVIRONMENT.redis.host}:${ENVIRONMENT.redis.port}`,
  );
  console.log(
    '[Identity Service] JWT_SECRET:',
    ENVIRONMENT.auth.JWT_SECRET
      ? `${ENVIRONMENT.auth.JWT_SECRET.substring(0, 5)}***`
      : 'UNDEFINED',
  );
  console.log('[Identity Service] Port:', process.env.PORT || '3002');
}

bootstrap();
