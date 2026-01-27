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
      },
    },
  );
  console.log('Loaded entities:', connectionOptions.entities);
  await app.listen();
  console.log('ENV DB HOST:', process.env.PORT);
  console.log('Course Microservice is running...');
}

bootstrap();
