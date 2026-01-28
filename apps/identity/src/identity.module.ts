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
        join(__dirname, '../../../.env'), // dev: apps/identity/src -> root
        join(__dirname, '../../../../.env'), // build: dist/apps/identity/src -> root
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
