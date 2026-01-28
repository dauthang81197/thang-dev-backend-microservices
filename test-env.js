// Simple test to verify .env file loading
const path = require('path');
const fs = require('fs');

console.log('=== ENV TEST ===');
console.log('Current directory:', __dirname);
console.log('Process cwd:', process.cwd());

// Check if .env exists
const envPath = path.join(__dirname, '.env');
console.log('\nChecking .env at:', envPath);
console.log('.env exists:', fs.existsSync(envPath));

// Read .env manually
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    console.log('\n.env content:\n', content);
}

// Check process.env
console.log('\n=== PROCESS.ENV ===');
console.log('POSTGRESQL_HOST:', process.env.POSTGRESQL_HOST);
console.log('POSTGRESQL_PORT:', process.env.POSTGRESQL_PORT);
console.log('POSTGRESQL_USER:', process.env.POSTGRESQL_USER);
console.log('POSTGRESQL_PASSWORD:', process.env.POSTGRESQL_PASSWORD);
console.log('POSTGRESQL_DB:', process.env.POSTGRESQL_DB);

// Test dotenv
console.log('\n=== Testing dotenv ===');
require('dotenv').config({ path: envPath });
console.log('After dotenv.config():');
console.log('POSTGRESQL_HOST:', process.env.POSTGRESQL_HOST);
console.log('POSTGRESQL_PORT:', process.env.POSTGRESQL_PORT);
console.log('POSTGRESQL_USER:', process.env.POSTGRESQL_USER);
console.log('POSTGRESQL_PASSWORD:', process.env.POSTGRESQL_PASSWORD);
console.log('POSTGRESQL_DB:', process.env.POSTGRESQL_DB);
