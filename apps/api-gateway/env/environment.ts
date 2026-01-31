export const ENVIRONMENT = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    pass: process.env.DB_PASSWORD || 'Admin@123',
    dbUser: process.env.DB_USER || 'postgres',
    dbName: process.env.DB_NAME || 'identity',
  },
  auth: {
    JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  },
  redis: {
    host: process.env.REDIS_HOST || '43.205.220.161',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || '',
    publicUrl: process.env.R2_PUBLIC_URL || '',
  },
};
