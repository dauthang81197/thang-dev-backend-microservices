import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { Environment } from '@app/common';
import { ENVIRONMENT } from '../env/environment';

dotenv.config({
  path: join(__dirname, '../../.env'),
});

const connectionOptions: TypeOrmModuleOptions &
  SeederOptions &
  DataSourceOptions = {
  type: 'postgres',
  host: ENVIRONMENT.database.host,
  port: parseInt(ENVIRONMENT.database.port, 10) || 5432,
  username: ENVIRONMENT.database.dbUser,
  password: ENVIRONMENT.database.pass,
  database: ENVIRONMENT.database.dbName,
  connectTimeoutMS: 0,
  synchronize: false,
  entities: [
    join(__dirname, '../modules/**/*.entity.{ts,js}'),
    // reuse flower entities since we share the same DB
    join(__dirname, '../../flower/src/shareds/entities/**/*.entity.{ts,js}'),
  ],
  logging: [Environment.local, Environment.dev].includes(
    process.env.ENV as Environment,
  )
    ? 'all'
    : ['warn', 'error'],
  migrationsTableName: 'migration',
  extra: {
    max: 5,
    min: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    keepAlive: true,
  },
};

export { connectionOptions };

export const AppDataSource = new DataSource(connectionOptions);
