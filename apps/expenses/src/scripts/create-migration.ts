import { execSync } from 'child_process';
import { resolve } from 'path';

const name = process.argv[2] || 'migration';
const migrationPath = resolve(
    __dirname,
    '..',
    'database',
    'migrations',
    name,
);

console.log(`Creating migration: ${migrationPath}`);
execSync(
    `npx typeorm migration:create ${migrationPath}`,
    { stdio: 'inherit' },
);
