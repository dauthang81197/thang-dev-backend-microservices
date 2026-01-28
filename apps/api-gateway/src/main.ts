// Load .env file FIRST before any imports
import { config } from 'dotenv';
import { join } from 'path';

// Load from project root (works in both dev and build mode)
const envPath = join(process.cwd(), '.env');
console.log('[ENV] Attempting to load .env from:', envPath);
const result = config({ path: envPath });
if (result.error) {
  console.error('[ENV] Error loading .env file:', result.error);
} else {
  console.log('[ENV] Successfully loaded .env file');
}

import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Microservices API Gateway')
    .setDescription('API Gateway for all services')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(8000);
  console.log(`Swagger running at http://localhost:8000/docs`);
}
bootstrap();
