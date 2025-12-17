import { Module } from '@nestjs/common';
import { BasePlatformModule } from './modules/base-platform.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { connectionOptions } from './database/ormconfig';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '.env'), // chạy khi phát triển (src)
        join(__dirname, '../../.env'), // chạy khi đã build (dist)
      ],
    }),

    TypeOrmModule.forRootAsync({
      useFactory() {
        return connectionOptions;
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    BasePlatformModule,
  ],
  controllers: [],
  providers: [],
})
export class IdentityModule {}
