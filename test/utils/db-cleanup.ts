import { Client } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL?.replace(/\?.*$/, '');

if (!DATABASE_URL) {
  throw new Error(
    'DATABASE_URL no está definido. Ejecuta los tests E2E dentro del contenedor api: docker compose exec api npm run test:e2e',
  );
}

export async function cleanDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  await client.connect();

  await client.query(`
        TRUNCATE TABLE
        "test_e2e"."BandMember",
        "test_e2e"."Band",
        "test_e2e"."Contest",
        "test_e2e"."OrganizationUser",
        "test_e2e"."Organization",
        "test_e2e"."User"
        CASCADE
    `);

  await client.end();
}
