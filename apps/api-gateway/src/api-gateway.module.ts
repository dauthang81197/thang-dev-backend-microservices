import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthGatewayController } from './controllers/identity/auth-gateway.controller';
import { UserGatewayController } from './controllers/identity/user-gateway.controller';
import { RoleGatewayController } from './controllers/identity/role-gateway.controller';
import { PermissionGatewayController } from './controllers/identity/permission-gateway.controller';
import { RBACGatewayController } from './controllers/identity/rbac-gateway.controller';
import { CourseGatewayController } from './controllers/course/course-gateway.controller';
import { CourseAdminGatewayController } from './controllers/course/course-admin-gateway.controller';
import { LessonGatewayController } from './controllers/course/lesson-gateway.controller';
import { HealthController } from './controllers/health.controller';
import { MinioGatewayController } from './controllers/storage/minio-gateway.controller';
import { DashboardGatewayController } from './controllers/expenses/dashboard-gateway.controller';
import { TransactionGatewayController } from './controllers/expenses/transaction-gateway.controller';
import { WalletGatewayController } from './controllers/expenses/wallet-gateway.controller';
import { CategoryGatewayController } from './controllers/expenses/category-gateway.controller';
import { BudgetGatewayController } from './controllers/expenses/budget-gateway.controller';
import { JwtStrategy } from './guards/jwt.strategy';
import { GoogleStrategy } from './guards/google.strategy';
import { MinioService } from './services/minio.service';
import { ENVIRONMENT } from '../env/environment';

export const CONTROLLER_IDENTITY = [
  AuthGatewayController,
  UserGatewayController,
  RoleGatewayController,
  PermissionGatewayController,
  RBACGatewayController,
];

export const CONTROLLER_COURSE = [
  CourseGatewayController,
  CourseAdminGatewayController,
  LessonGatewayController,
];

export const CONTROLLER_STORAGE = [MinioGatewayController];

export const CONTROLLER_EXPENSES = [
  DashboardGatewayController,
  TransactionGatewayController,
  WalletGatewayController,
  CategoryGatewayController,
  BudgetGatewayController,
];

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET || 'thang2026';
        console.log(
          '[API Gateway Module] JWT_SECRET:',
          secret ? `${secret.substring(0, 5)}***` : 'UNDEFINED',
        );
        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: ENVIRONMENT.redis.host,
          port: Number(ENVIRONMENT.redis.port) || 6379,
          retryAttempts: 5,
          retryDelay: 3000,
          connectTimeout: 10000,
          keepAlive: 30000,
          lazyConnect: false,
          enableOfflineQueue: true,
          enableReadyCheck: true,
          maxRetriesPerRequest: 3,
        },
      },
      {
        name: 'COURSE_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: ENVIRONMENT.redis.host || 'localhost',
          port: Number(ENVIRONMENT.redis.port) || 6379,
          retryAttempts: 5,
          retryDelay: 3000,
          connectTimeout: 10000,
          keepAlive: 30000,
          lazyConnect: false,
          enableOfflineQueue: true,
          enableReadyCheck: true,
          maxRetriesPerRequest: 3,
        },
      },
      {
        name: 'EXPENSES_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: ENVIRONMENT.redis.host || 'localhost',
          port: Number(ENVIRONMENT.redis.port) || 6379,
          retryAttempts: 5,
          retryDelay: 3000,
          connectTimeout: 10000,
          keepAlive: 30000,
          lazyConnect: false,
          enableOfflineQueue: true,
          enableReadyCheck: true,
          maxRetriesPerRequest: 3,
        },
      },
    ]),
  ],
  controllers: [
    HealthController,
    ...CONTROLLER_IDENTITY,
    ...CONTROLLER_COURSE,
    ...CONTROLLER_STORAGE,
    ...CONTROLLER_EXPENSES,
  ],
  providers: [JwtStrategy, GoogleStrategy, MinioService],
})
export class ApiGatewayModule {}
