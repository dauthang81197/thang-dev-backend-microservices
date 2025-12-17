import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IdentityModule } from './identity.module';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { connectionOptions } from './database/ormconfig';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    IdentityModule,
    {
      transport: Transport.REDIS,
      options: {
        host: '192.168.50.22',
        port: 6379,
      },
    },
  );
  console.log('Loaded entities:', connectionOptions.entities);
  await app.listen();
  console.log('ENV DB HOST:', process.env.PORT);
  console.log('Identity Microservice is running...');
}

bootstrap();
