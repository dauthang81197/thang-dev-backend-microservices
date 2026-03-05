import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { connectionOptions } from './database/ormconfig';
import { NotificationCoreModule } from './modules/notification-core.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '../../../.env'),
        join(__dirname, '../../../../.env'),
      ],
    }),
    TypeOrmModule.forRoot(connectionOptions),
    NotificationCoreModule,
  ],
  controllers: [],
  providers: [],
})
export class NotificationModule {}
