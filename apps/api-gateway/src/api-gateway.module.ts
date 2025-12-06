import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGatewayController } from './controllers/identity/auth-gateway.controller';

export const CONTROLLER_IDENTITY = [AuthGatewayController];

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: '192.168.50.22',
          port: 6379,
        },
      },
    ]),
  ],
  controllers: [...CONTROLLER_IDENTITY],
})
export class ApiGatewayModule {}
