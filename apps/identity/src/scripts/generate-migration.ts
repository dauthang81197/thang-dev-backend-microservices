import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const dataSourcePath = './apps/identity/src/database/migrations';

async function generateMigration(migrationName: string): Promise<void> {
  const migrationFullPath = `${dataSourcePath}/${migrationName}`;

  try {
    const { stdout, stderr } = await execAsync(
      `npm run typeorm -- migration:generate -d  apps/identity/src/database/ormconfig.ts ${migrationFullPath}`,
    );

    console.log(stdout);
    if (stderr) {
      console.error('Error:', stderr);
    }
  } catch (error) {
    console.error('Failed to generate migration:', error);
  }
}

const migrationName = process.argv[2];
console.log('name', migrationName);

if (!migrationName) {
  console.error('Please provide a name for the migration.');
  process.exit(1);
}

generateMigration(migrationName);
