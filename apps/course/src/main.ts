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
        host: ENVIRONMENT.redis.host,
        port: ENVIRONMENT.redis.port,
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
  console.log('ENV DB HOST:', process.env.PORT);
  console.log('Course Microservice is running...');
  console.log('Redis connected at:', `${ENVIRONMENT.redis.host}:${ENVIRONMENT.redis.port}`);
}

bootstrap();
