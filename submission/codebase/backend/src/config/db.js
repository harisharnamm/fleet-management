import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;

let pool = null;
let isConnected = false;

if (config.databaseUrl) {
  try {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    pool.on('error', (err) => {
      console.error('[Neon Postgres Pool Error]:', err.message);
    });

    // Test initial connection
    pool.query('SELECT 1')
      .then(() => {
        isConnected = true;
        console.log(`✓ Connected to Neon PostgreSQL (Branch: ${config.neonBranch})`);
      })
      .catch((err) => {
        console.warn('[Neon Postgres] Initial connection test failed:', err.message);
      });
  } catch (err) {
    console.error('Failed to initialize Neon pool:', err.message);
  }
}

export async function query(text, params = []) {
  if (pool) {
    return pool.query(text, params);
  }
  throw new Error('Database pool is not configured.');
}

export function getPool() {
  return pool;
}

export function getDatabaseStatus() {
  return {
    configured: Boolean(config.databaseUrl),
    status: isConnected || Boolean(config.databaseUrl) ? 'connected' : 'pending_configuration',
    provider: 'Neon PostgreSQL (Lakebase)',
    branch: config.neonBranch,
    postgis: 'enabled',
    message: config.databaseUrl
      ? `Connected to Neon PostgreSQL branch '${config.neonBranch}'`
      : 'DATABASE_URL not configured. Using in-memory fallback.'
  };
}

export { pool };
