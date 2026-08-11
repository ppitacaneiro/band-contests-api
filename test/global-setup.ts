import { execSync } from 'child_process';
import { Client } from 'pg';

const DATABASE_URL ='postgresql://band_contests:band_contests_dev@postgres:5432/band_contests';

export default async function globalSetup() {
    console.log('\n[E2E] Preparing test database...');
    
    const client = new Client({
        connectionString: DATABASE_URL,
    });

    await client.connect();

    try {
        await client.query('CREATE SCHEMA IF NOT EXISTS test_e2e',);
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