# AGENTS.md

API REST (NestJS + TypeScript + Prisma + PostgreSQL) para concursos de bandas. Arquitectura modular `Controller -> Service -> Repository -> Prisma`.

## Comandos

```bash
# Desarrollo (recomendado): la app corre dentro de Docker con hot-reload
docker compose up -d                 # levanta api (3001) + postgres (5432)
docker compose logs -f api

# Prisma: ejecutar SIEMPRE dentro del contenedor api
docker compose exec api npx prisma generate   # NO hay postinstall: obligatorio tras npm ci
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma migrate dev --name <nombre>

# Tests
npm test                  # unitarios (no requieren DB; rootDir=src, *.spec.ts)
docker compose exec api npm run test:e2e   # OJO: debe correr DENTRO del contenedor (ver convenciones)
npm run lint              # OJO: incluye --fix, modifica archivos
```

## Gotchas de Prisma v7 (no obvios)

- `prisma/schema.prisma`: el datasource **no tiene `url`**. El CLI lo lee de `prisma.config.ts` (`DATABASE_URL`); en runtime se usa driver adapter `@prisma/adapter-pg` (ver `src/prisma/prisma.service.ts`).
- El cliente generado sale a `generated/prisma/` (gitignored, no se versiona) y se importa como `../../generated/prisma/client`. **Si no existe, ni la app ni los tests compilan** (los `*.spec.ts` importan `prisma.service`, que lo usa): hay que ejecutar `prisma generate` después de cada `npm ci` y antes de `npm test`.
- `PRISMA_SCHEMA` (env) selecciona el schema PostgreSQL; los tests e2e lo usan para aislar `test_e2e`.
- Las migraciones se aplican a un schema determinado según la `DATABASE_URL`/`PRISMA_SCHEMA` activa.

## Entorno

- `.env` no está versionado y es **obligatorio** (`JWT_SECRET` se lee con `getOrThrow` en `src/auth/auth.module.ts`). Copiar `.env.example` y rellenar `DATABASE_URL` y `JWT_SECRET`.
- `docker-compose.yml` fija `DATABASE_URL` y `PORT` del contenedor, pero **no** `JWT_SECRET`; el `.env` del host se monta vía bind mount (`.:/app`).

## Tests (convenciones)

- **Unitarios**: instancian clases directamente (`new Service({ findByEmail: jest.fn() })`), **no** usan `Test.createTestingModule`. `bcrypt` se mockea con `jest.mock('bcrypt')`. Se espera cobertura del 100% en controllers/services/repos/DTOs/utilidades (los `*.module.ts`, `app.module.ts` y `main.ts` quedan sin testear a propósito).
- **E2E**: requieren postgres en Docker y **deben ejecutarse dentro del contenedor api** (`docker compose exec api npm run test:e2e`), porque `test/setup-e2e.ts` hardcodea el host `postgres`, que solo resuelve dentro de la red Docker (sin mapeo en el host). `test/global-setup.ts` crea el schema `test_e2e` y aplica migraciones; `test/setup-e2e.ts` fija env; `test/utils/db-cleanup.ts` trunca tablas antes de cada test. `maxWorkers: 1`, timeout 30s. La config de la app en los e2e debe replicar `main.ts` (prefijo `api` + `ValidationPipe`).

## Arquitectura

- `src/users` exporta `UsersService` y `UsersRepository` (AuthModule los importa).
- Repositorios abstraten `PrismaService`; los services no tocan Prisma directamente.
- `AuthModule` usa `PassportModule` + `JwtModule.registerAsync` con `JWT_SECRET`.
- Rutas de organizations usan `@UseGuards(JwtAuthGuard)` a nivel de controller y `@CurrentUser()` para el usuario autenticado.
- DTOs validados por el `ValidationPipe` global (`whitelist` + `forbidNonWhitelisted`: campos extra en el body -> 400).

## Otras notas

- Imports mezclan rutas relativas (`../users/...`) y absolutas (`src/users/...`); tsconfig tiene `baseUrl: "./"`, y jest mapea `*.js -> *` (módulos `nodenext`).
- `GET /api/organizations/:id` aún no verifica pertenencia del usuario a la organización (autorización por reforzar).