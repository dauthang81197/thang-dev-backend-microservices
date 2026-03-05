export const ENVIRONMENT = {
  database: {
    host: process.env.DB_HOST || '144.91.120.200',
    port: process.env.DB_PORT || '5432',
    pass: process.env.DB_PASSWORD || 'Admin@123',
    dbUser: process.env.DB_USER || 'postgres',
    dbName: process.env.DB_NAME_FLOWER || 'expenses',
  },
  redis: {
    host: process.env.REDIS_HOST || '144.91.120.200',
    port: process.env.REDIS_PORT || '6379',
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },
};
