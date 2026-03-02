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
    logNotifications: true,
    synchronize: false,
    entities: [
        join(__dirname, '../shareds/entities/**/*.entity.{ts,js}'),
        join(__dirname, '../modules/**/*.entity.{ts,js}'),
    ],
    poolErrorHandler: (err) => {
        console.log(err);
    },
    logging: [Environment.local, Environment.dev].includes(
        process.env.ENV as Environment,
    )
        ? 'all'
        : ['warn', 'error'],
    logger: 'debug',
    migrationsTableName: 'migration',
    maxQueryExecutionTime: parseInt(
        process.env.MAX_QUERY_EXECUTION_TIME || '500',
        10,
    ),
    extra: {
        max: 10,
        min: 2,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 0,
    },
    ssl: false,
    migrations: [join(__dirname, '..', 'database/migrations/*{.js,.ts}')],
    seeds: [join(__dirname, '..', 'database/seeds/*.seeder.{ts,js}')],
    factories: [join(__dirname, '..', 'database/factories/*.factory.{ts,js}')],
    subscribers: [join(__dirname, '..', 'modules/**/*.subscriber.{ts,js}')],
};

const dataSource = new DataSource(connectionOptions);

export { connectionOptions, dataSource };
