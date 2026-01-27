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
  r2: {
    accountId: 'e751f9503f859179aea8642167ce5bfd',
    accessKeyId: '8c518e8059ae8131ac69c738bccd1bd5',
    secretAccessKey:
      '6cc2017c09e33f276e1c0b01657ea8cb2fd829c474847a0bc5cdd2b27098dd89',
    bucketName: 'course',
    publicUrl: 'https://pub-5e52d815a0ea48b5aa905910e63faf7b.r2.dev',
  },
};

export const ENVIRONMENT_DEV = {
  database: {
    host: '192.168.50.22',
    port: 5432,
    pass: 'Admin@123',
    dbUser: 'dauthang',
    dbName: 'identity',
  },
  redis: { host: '192.168.50.22', port: 6379 },
  r2: {
    accountId: 'e751f9503f859179aea8642167ce5bfd',
    accessKeyId: '8c518e8059ae8131ac69c738bccd1bd5',
    secretAccessKey:
      '6cc2017c09e33f276e1c0b01657ea8cb2fd829c474847a0bc5cdd2b27098dd89',
    bucketName: 'course',
    publicUrl: 'https://pub-5e52d815a0ea48b5aa905910e63faf7b.r2.dev',
  },
};
