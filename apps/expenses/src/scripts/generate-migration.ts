import { execSync } from 'child_process';
import { resolve } from 'path';

const name = process.argv[2] || 'migration';
const dataSourcePath = resolve(
    __dirname,
    '..',
    'database',
    'ormconfig.ts',
);
const migrationPath = resolve(
    __dirname,
    '..',
    'database',
    'migrations',
    name,
);

console.log(`Generating migration: ${migrationPath}`);
execSync(
    `npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate ${migrationPath} -d ${dataSourcePath}`,
    { stdio: 'inherit' },
);
