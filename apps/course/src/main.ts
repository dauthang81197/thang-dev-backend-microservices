// Load .env file FIRST before any imports
import { config } from 'dotenv';
import { join } from 'path';

// Load from project root (works in both dev and build mode)
const envPath = join(process.cwd(), '.env');
console.log('[ENV] Attempting to load .env from:', envPath);
const result = config({ path: envPath, debug: true });
if (result.error) {
  console.error('[ENV] Error loading .env file:', result.error);
} else {
  console.log('[ENV] Successfully loaded .env file');
  console.log(
    '[ENV] Loaded variables:',
    Object.keys(result.parsed || {}).join(', '),
  );
}

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CourseModule } from './course.module';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { connectionOptions } from './database/ormconfig';
import { ENVIRONMENT } from './env/environment';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CourseModule,
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
  console.log('Loaded entities:', connectionOptions.entities);
  await app.listen();
  console.log('ENV POSTGRESQL_HOST:', process.env.POSTGRESQL_HOST);
  console.log('ENV POSTGRESQL_PORT:', process.env.POSTGRESQL_PORT);
  console.log('ENV POSTGRESQL_DB:', process.env.POSTGRESQL_DB);
  console.log('ENV POSTGRESQL_USER:', process.env.POSTGRESQL_USER);
  console.log('ENVIRONMENT.database.host:', ENVIRONMENT.database.host);
  console.log('ENVIRONMENT.database.port:', ENVIRONMENT.database.port);
  console.log('Course Microservice is running...');
  console.log(
    'Redis connected at:',
    `${ENVIRONMENT.redis.host}:${ENVIRONMENT.redis.port}`,
  );
}

bootstrap();
