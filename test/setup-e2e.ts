const rawDatabaseUrl = process.env.DATABASE_URL;

if (!rawDatabaseUrl) {
  throw new Error(
    'DATABASE_URL no está definido. Ejecuta los tests E2E dentro del contenedor api: docker compose exec api npm run test:e2e',
  );
}

process.env.DATABASE_URL = rawDatabaseUrl.replace(/\?.*$/, '');
process.env.PRISMA_SCHEMA = 'test_e2e';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.THROTTLE_TTL_MS = '60000';
process.env.THROTTLE_LIMIT = '100000';
process.env.THROTTLE_LOGIN_LIMIT = '100000';
process.env.THROTTLE_LOGIN_TTL_MS = '60000';
