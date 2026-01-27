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
import { JwtStrategy } from './guards/jwt.strategy';
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
];

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'supersecret', // Same secret as identity service
      signOptions: { expiresIn: '1h' },
    }),
    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: ENVIRONMENT.redis.host,
          port: ENVIRONMENT.redis.port,
        },
      },
      {
        name: 'COURSE_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: ENVIRONMENT.redis.host,
          port: ENVIRONMENT.redis.port,
        },
      },
    ]),
  ],
  controllers: [...CONTROLLER_IDENTITY, ...CONTROLLER_COURSE],
  providers: [JwtStrategy],
})
export class ApiGatewayModule {}
