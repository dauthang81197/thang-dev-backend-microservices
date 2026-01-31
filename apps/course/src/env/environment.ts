export const ENVIRONMENT = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    pass: process.env.DB_PASSWORD || 'Admin@123',
    dbUser: process.env.DB_USER || 'postgres',
    dbName: process.env.DB_NAME_COURSE || 'course',
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
