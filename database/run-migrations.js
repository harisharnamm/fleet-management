import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

// Load .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_aX2vzkr1VFwH@ep-noisy-river-bepbpn0o.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require';

console.log('Connecting to Neon PostgreSQL for migrations...');

const client = new pg.Client({
  connectionString
});

async function runMigrations() {
  try {
    await client.connect();
    console.log('Connected to Neon database successfully.');

    const migrationFiles = [
      '01_init_extensions.sql',
      '02_create_tables.sql',
      '03_create_functions_and_indexes.sql',
      '04_seed_data.sql'
    ];

    const migrationsDir = path.resolve(process.cwd(), 'database/migrations');

    for (const file of migrationFiles) {
      console.log(`\nExecuting migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query(sql);
      console.log(`✓ Migration ${file} applied successfully.`);
    }

    console.log('\n==================================================');
    console.log(' All Neon Database Migrations Applied Successfully!');
    console.log('==================================================\n');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
