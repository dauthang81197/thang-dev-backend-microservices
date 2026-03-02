export const ENVIRONMENT = {
  database: {
    host: process.env.DB_HOST || '144.91.120.200',
    port: process.env.DB_PORT || '5432',
    pass: process.env.DB_PASSWORD || 'Admin@123',
    dbUser: process.env.DB_USER || 'postgres',
    dbName: process.env.DB_NAME || 'identity',
  },
  auth: {
    JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3000/api/v1/auth/google/callback',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  redis: {
    host: process.env.REDIS_HOST || '144.91.120.200',
    port: process.env.REDIS_PORT || '6379',
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || 'course-videos',
    publicUrl: process.env.R2_PUBLIC_URL || '',
  },
};
