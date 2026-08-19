import { Client } from 'pg';

export async function cleanDatabase() {
    const client = new Client({
        connectionString:
        'postgresql://band_contests:band_contests_dev@postgres:5432/band_contests',
    });

    await client.connect();

    await client.query(`
        TRUNCATE TABLE
        "test_e2e"."Contest",
        "test_e2e"."OrganizationUser",
        "test_e2e"."Organization",
        "test_e2e"."User"
        CASCADE
    `);

    await client.end();
}