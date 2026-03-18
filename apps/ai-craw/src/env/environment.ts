export const ENVIRONMENT = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    pass: process.env.DB_PASSWORD || 'Admin@123',
    dbUser: process.env.DB_USER || 'postgres',
    dbName: process.env.DB_NAME_AI_CRAW || 'ai_craw',
  },
  auth: {
    JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || '6379',
  },
  openClaw: {
    url: process.env.OPENCLAW_URL || 'https://api.openclaw.ai/v1',
    token: process.env.OPENCLAW_TOKEN || '',
  },
};
