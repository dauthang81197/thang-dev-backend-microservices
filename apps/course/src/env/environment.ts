export const ENVIRONMENT = {
  database: {
    host: process.env.POSTGRESQL_HOST || 'localhost',
    port: parseInt(process.env.POSTGRESQL_PORT || '5432'),
    pass: process.env.POSTGRESQL_PASSWORD || 'Admin@123',
    dbUser: process.env.POSTGRESQL_USER || 'postgres',
    dbName: process.env.POSTGRESQL_DB || 'course',
  },
  auth: {
    JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || 'course-videos',
    publicUrl: process.env.R2_PUBLIC_URL || '',
  },
};
