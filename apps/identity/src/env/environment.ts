export const ENVIRONMENT = {
  database: {
    host: '192.168.50.22',
    port: 5432,
    pass: 'Admin@123',
    dbUser: 'dauthang',
    dbName: 'identity',
  },
  auth: {
    JWT_SECRET: 'supersecret',
  },
  redis: { host: '192.168.50.22', port: 6379 },
};

export const ENVIRONMENT_DEV = {
  database: {
    host: '192.168.50.22',
    port: 5432,
    pass: 'Admin@123',
    dbUser: 'postgres',
    dbName: 'identity',
  },
  redis: { host: '192.168.50.22', port: 6379 },
};
