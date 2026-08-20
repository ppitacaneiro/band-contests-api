import { execSync } from 'child_process';
import { Client } from 'pg';

function getBaseDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;

  if (!raw) {
    throw new Error(
      'DATABASE_URL no está definido. Ejecuta los tests E2E dentro del contenedor api: docker compose exec api npm run test:e2e',
    );
  }

  return raw.replace(/\?.*$/, '');
}

export default async function globalSetup() {
  const DATABASE_URL = getBaseDatabaseUrl();

  console.log('\n[E2E] Preparing test database...');

  const client = new Client({
    connectionString: DATABASE_URL,
  });

  await client.connect();

  try {
    await client.query('CREATE SCHEMA IF NOT EXISTS test_e2e');
    console.log('[E2E] Schema test_e2e ready');
  } catch (error) {
    console.error('[E2E] Error creating schema test_e2e:', error);
    throw error;
  } finally {
    await client.end();
  }

  console.log('[E2E] Applying migrations...');

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: `${DATABASE_URL}?schema=test_e2e`,
    },
  });

  console.log('[E2E] Test database ready\n');
}
