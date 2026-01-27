export const ENVIRONMENT = {
  database: {
    host: '192.168.50.22',
    port: 5432,
    pass: 'Admin@123',
    dbUser: 'dauthang',
    dbName: 'course',
  },
  auth: {
    JWT_SECRET: 'supersecret',
  },
  redis: { host: '192.168.50.22', port: 6379 },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || 'course-videos',
    publicUrl: process.env.R2_PUBLIC_URL || '',
  },
};

export const ENVIRONMENT_DEV = {
  database: {
    host: '192.168.50.22',
    port: 5432,
    pass: 'Admin@123',
    dbUser: 'dauthang',
    dbName: 'course',
  },
  redis: { host: '192.168.50.22', port: 6379 },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || 'course-videos',
    publicUrl: process.env.R2_PUBLIC_URL || '',
  },
};
