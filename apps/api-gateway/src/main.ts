// Load .env file FIRST before any imports
import * as dotenv from 'dotenv';
import { resolve, join } from 'path';

const envPath = resolve(process.cwd(), '.env');
console.log('[API Gateway] Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('[API Gateway] Failed to load .env:', result.error.message);
} else {
  console.log('[API Gateway] .env loaded successfully');
  console.log('[API Gateway] JWT_SECRET from process.env:', process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 5)}***` : 'UNDEFINED');
}

import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from '@app/common';
import { ENVIRONMENT } from '../env/environment';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // Global Logging Interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // CORS Configuration
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Microservices API Gateway')
    .setDescription('API Gateway for all services')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'API Gateway Documentation',
  });
  console.log('[API Gateway] Swagger documentation enabled at /docs');

  // Port Configuration
  const port = parseInt(process.env.PORT || '8000', 10);
  await app.listen(port, '0.0.0.0');

  console.log(`[API Gateway] Server running on port ${port}`);
  console.log(`[API Gateway] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[API Gateway] JWT_SECRET: ${ENVIRONMENT.auth.JWT_SECRET ? `${ENVIRONMENT.auth.JWT_SECRET.substring(0, 5)}***` : 'UNDEFINED'}`);
  console.log(`[API Gateway] CORS Origin: ${corsOrigin}`);
  console.log(`[API Gateway] Swagger documentation: /docs`);
}
bootstrap();
