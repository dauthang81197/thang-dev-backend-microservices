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

  await app.listen();

  console.log('[Course Service] Microservice is running');
  console.log('[Course Service] Environment:', process.env.NODE_ENV || 'development');
  console.log('[Course Service] Database:', `${ENVIRONMENT.database.host}:${ENVIRONMENT.database.port}/${ENVIRONMENT.database.dbName}`);
  console.log('[Course Service] Redis:', `${ENVIRONMENT.redis.host}:${ENVIRONMENT.redis.port}`);
  console.log('[Course Service] Port:', process.env.PORT || '3003');
  console.log('[Course Service] R2 Bucket:', ENVIRONMENT.r2.bucketName);
}

bootstrap();
