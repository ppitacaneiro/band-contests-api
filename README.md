docker compose up -d
# Band Contests API

API REST para la plataforma SaaS de concursos de bandas musicales.

## Resumen

API backend desarrollado con NestJS, TypeScript y Prisma para PostgreSQL. Proporciona autenticación mediante JWT y funcionalidad para gestionar usuarios, organizaciones, concursos y bandas.

---

## Tecnologías

- **Node.js**
- **TypeScript**
- **NestJS**
- **Prisma ORM**
- **PostgreSQL**
- **JWT** (autenticación)
- **Passport / passport-jwt** (protección de endpoints)
- **bcrypt** (hash de contraseñas)
- **Docker & Docker Compose**

### Herramientas de desarrollo

- `npm`
- `Prisma CLI`
- `git`

---

## Arquitectura

Arquitectura modular con separación en `Controller -> Service -> Repository -> Prisma -> PostgreSQL`.

```text
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
PostgreSQL
```

Responsabilidades principales:

- Controller: recibe peticiones HTTP, valida DTOs y devuelve respuestas.
- Service: contiene la lógica de negocio.
- Repository: abstrae el acceso a datos (usa `PrismaService`).
- Prisma: modelos, migraciones y Prisma Client.

---

## Estructura del proyecto (resumen)

```
src/
├── auth/
│   ├── dto/
│   │   └── login.dto.ts
│   ├── interfaces/
│   │   └── authenticated-user.interface.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── current-user.decorator.ts
│   ├── jwt-auth.guard.ts
│   └── jwt.strategy.ts
├── users/
│   ├── users.controller.ts
│   ├── users.module.ts
│   ├── users.repository.ts
│   └── users.service.ts
├── organizations/
│   ├── dto/
│   │   └── create-organization.dto.ts
│   ├── organizations.controller.ts
│   ├── organizations.module.ts
│   ├── organizations.repository.ts
│   └── organizations.service.ts
├── contests/
│   ├── dto/
│   │   └── create-contest.dto.ts
│   ├── contests.controller.ts
│   ├── contests.module.ts
│   ├── contests.repository.ts
│   ├── contests.service.ts
│   └── organizations-contests.controller.ts
├── bands/
│   ├── dto/
│   │   ├── add-band-member.dto.ts
│   │   ├── create-band.dto.ts
│   │   └── update-band.dto.ts
│   ├── band-members.controller.ts
│   ├── band-members.service.ts
│   ├── bands.controller.ts
│   ├── bands.module.ts
│   ├── bands.repository.ts
│   └── bands.service.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── common/
│   └── utils/
│       └── slug.util.ts
├── app.module.ts
└── main.ts

prisma/
├── migrations/
├── schema.prisma
└── prisma.config.ts

docker-compose.yml
Dockerfile
package.json
tsconfig.json
```

---

## Entorno de desarrollo

### Requisitos

- `Docker`
- `Docker Compose`
- `git`

No es necesario instalar PostgreSQL ni Node.js localmente si se usa Docker.

### Levantar el entorno

```bash
docker compose up -d
```

Ver logs de la API:

```bash
docker compose logs -f api
```

La API estará disponible en: `http://localhost:3001`

---

## Servicios Docker (resumen)

Ejemplo de servicios relevantes en `docker-compose.yml`:

- API (`api`): `3001:3001`
- PostgreSQL (`postgres`): `postgres:17-alpine`, `5432:5432`

Credenciales de desarrollo (ejemplo):

- Database: `band_contests`
- User: `band_contests`
- Password: `band_contests_dev`
- Host: `postgres`
- Port: `5432`

Cadena de conexión de ejemplo:

```
DATABASE_URL=postgresql://band_contests:band_contests_dev@postgres:5432/band_contests?schema=public
```

---

## Prisma

Comandos útiles (ejecutar dentro del contenedor `api`):

```bash
docker compose exec api npx prisma generate
docker compose exec api npx prisma migrate status
docker compose exec api npx prisma migrate dev --name <nombre_migracion>
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma migrate reset
```

`migrate reset` elimina todos los datos: no usar en producción.

---

## Modelo de datos (resumen)

### User

- `id`
- `name`
- `email`
- `password`
- `role` (ADMIN, ORGANIZER, JURY, BAND)
- `emailVerifiedAt`
- `createdAt`
- `updatedAt`

### Organization

- `id`
- `name`
- `slug` (único)
- `createdAt`
- `updatedAt`

Ejemplo de slug generado: `festival-de-musica-de-coruna` (si existe, se añade sufijo `-2`, `-3`, ...)

### OrganizationUser (relación)

- `id`
- `userId`
- `organizationId`
- `role` (OWNER, ADMIN, MEMBER)
- `createdAt`
- `updatedAt`

Restricción: `(userId, organizationId)` es única.

### Contest

- `id`
- `name`
- `description`
- `posterUrl`
- `latitude`
- `longitude`
- `startsAt`
- `endsAt`
- `registrationDeadline`
- `rules`
- `status` (ver enum `ContestStatus`)
- `votingMode` (ver enum `ContestVotingMode`)
- `organizationId` (relación `Organization` con borrado en cascada)
- `createdAt`
- `updatedAt`

Enums:

- `ContestStatus`: `DRAFT`, `PUBLISHED`, `OPEN`, `VOTING`, `CLOSED`, `FINISHED`.
- `ContestVotingMode`: `JURY`, `PUBLIC`, `MIXED`.

`Organization` tiene relación `contests` (uno a muchos).

### Band

- `id`
- `name`
- `description`
- `genre`
- `city`
- `createdAt`
- `updatedAt`

### BandMember (relación)

- `id`
- `bandId`
- `userId`
- `role` (OWNER, MANAGER)
- `createdAt`
- `updatedAt`

Restricción: `(bandId, userId)` es única.

El usuario que crea una banda se asigna automáticamente como `OWNER`.

Enums:

- `BandRole`: `OWNER`, `MANAGER`.

---

## Autenticación

Autenticación basada en `JWT` usando `Passport` y `bcrypt` para las contraseñas.

Flujo:

1. El usuario envía `email` y `password` a `POST /api/auth/login`.
2. Backend valida credenciales (bcrypt) y genera un JWT.
3. Devuelve un `accessToken` al cliente.

Ejemplo de petición:

```json
{
  "email": "carlos@example.com",
  "password": "password"
}
```

Ejemplo de respuesta:

```json
{
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": "7d"
}
```

Rutas protegidas: usar `@UseGuards(JwtAuthGuard)` y enviar header `Authorization: Bearer <token>`.

---

## Usuario autenticado

El usuario autenticado se obtiene mediante el decorador `@CurrentUser()`.

Ejemplo:

```ts
@Get()
async findMine(@CurrentUser() user: AuthenticatedUser) {
  return this.organizationsService.findByUserId(user.id);
}
```

La interfaz `AuthenticatedUser` contiene al menos `id` y `email` procedentes del JWT.

---

## Endpoints principales

Base URL: `/api`

### Auth

- `POST /api/auth/login` — Inicia sesión.

Request:

```json
{
  "email": "carlos@example.com",
  "password": "password"
}
```

Response: token JWT (ver arriba).

### Organizations

Todos los endpoints de organizaciones requieren JWT.

- Header: `Authorization: Bearer <accessToken>`
- `POST /api/organizations` — Crear organización (el usuario autenticado se asigna como `OWNER`).

Request:

```json
{
  "name": "Festival de Música de Coruña"
}
```

- `GET /api/organizations` — Obtener organizaciones del usuario autenticado.
- `GET /api/organizations/:id` — Obtener organización por ID (la autorización por pertenencia necesita refuerzo).

### Contests

Todos los endpoints de concursos requieren JWT y pertenencia a la organización.

- Header: `Authorization: Bearer <accessToken>`
- `POST /api/organizations/:organizationId/contests` — Crear concurso (solo roles `OWNER` o `ADMIN` de la organización). Valida que `endsAt` sea posterior a `startsAt`.

Request:

```json
{
  "name": "Batalla de Bandas",
  "description": "Concurso de bandas emergentes",
  "startsAt": "2026-09-01T00:00:00.000Z",
  "endsAt": "2026-09-03T00:00:00.000Z",
  "votingMode": "JURY"
}
```

- `GET /api/organizations/:organizationId/contests` — Obtener los concursos de una organización.
- `GET /api/contests/:id` — Obtener concurso por ID.

### Bands

Todos los endpoints de bandas requieren JWT.

- Header: `Authorization: Bearer <accessToken>`
- `POST /api/bands` — Crear banda (el usuario autenticado se asigna como `OWNER`).

Request:

```json
{
  "name": "Los Deltonos",
  "genre": "Rock",
  "city": "Santander"
}
```

- `GET /api/bands` — Obtener las bandas del usuario autenticado.
- `GET /api/bands/:id` — Obtener banda por ID (requiere ser miembro de la banda).
- `PATCH /api/bands/:id` — Actualizar banda (solo rol `OWNER`).

Miembros de la banda:

- `GET /api/bands/:bandId/members` — Listar miembros (requiere ser miembro).
- `POST /api/bands/:bandId/members` — Añadir miembro (solo `OWNER` o `MANAGER`). Rol por defecto `MANAGER`.

Request:

```json
{
  "userId": "uuid-del-usuario",
  "role": "MANAGER"
}
```

- `DELETE /api/bands/:bandId/members/:userId` — Eliminar miembro (solo `OWNER` o `MANAGER`). No permite eliminar el último `OWNER`.

---

## Flujo actual (resumen)

```text
Usuario
  │
  ▼
POST /api/auth/login
  │
  ▼
JWT (accessToken)
  │
  ▼
Acceso a endpoints protegidos
```

---

## Tests

El proyecto usa **Jest** con `ts-jest`. Existen dos suites de tests:

- **Unitarios** (`*.spec.ts`): colocados junto al código fuente. No dependen de PostgreSQL: todas las dependencias (repositorios, `bcrypt`, `JwtService`, etc.) se mockean.
- **End-to-end** (`test/*.e2e-spec.ts`): ejercitan la API completa contra una PostgreSQL real en Docker (ver abajo).

### Ejecutar tests

```bash
# En local (si tienes Node instalado)
npm test              # ejecuta todos los tests unitarios
npm run test:watch    # modo watch
npm run test:cov      # con reporte de cobertura (carpeta coverage/)

# Dentro de Docker
docker compose exec api npm test
docker compose exec api npm run test:cov
```

### Cobertura actual

Cobertura del 100% de statements en controllers, services, repositories, DTOs y utilidades de los módulos `auth`, `users`, `organizations`, `contests`, `bands`, `common/utils`, `prisma` y `health`. Los archivos `*.module.ts`, `app.module.ts` y `main.ts` (wiring de NestJS) quedan intencionadamente sin tests unitarios.

### Convenciones

- Los tests instancian las clases directamente (`new Service(mockDep)`) con dependencias mockeadas vía `jest.fn()`, en vez de `Test.createTestingModule`.
- `bcrypt` se mockea con `jest.mock('bcrypt')`.
- Casos cubiertos: lógica de negocio (login, hash de contraseñas, colisión de slugs `nombre` → `nombre-2` → `nombre-3`, asignación de rol `OWNER`), validación de DTOs (`class-validator`), y manejo de errores (`ConflictException`, `NotFoundException`, `UnauthorizedException`).

### Tests end-to-end (e2e)

Los tests e2e ejercitan la API real (Nest app completa) contra una base de datos PostgreSQL en Docker, con `supertest` sobre el servidor HTTP.

#### Requisitos

- Entorno levantado (`docker compose up -d`), incluyendo PostgreSQL.
- Prisma Client generado (`docker compose exec api npx prisma generate`).

#### Ejecutar

```bash
docker compose exec api npm run test:e2e
```

> **Importante**: deben ejecutarse **dentro del contenedor `api`**. Los archivos `test/setup-e2e.ts` y `test/global-setup.ts` hardcodean el host `postgres`, que solo resuelve dentro de la red de Docker (no hay mapeo al host).

#### Qué hacen el setup y el cleanup

- `test/global-setup.ts`: crea el schema `test_e2e` en PostgreSQL y aplica las migraciones con `prisma migrate deploy`.
- `test/setup-e2e.ts`: fija las variables de entorno (`DATABASE_URL`, `PRISMA_SCHEMA=test_e2e`, `JWT_SECRET`, `JWT_EXPIRES_IN`).
- `test/utils/db-cleanup.ts`: trunca las tablas de `test_e2e` antes de cada test.

#### Configuración

- `test/jest-e2e.json`: `maxWorkers: 1`, timeout de 30s, patrón `*.e2e-spec.ts`.
- La configuración de la app en los e2e replica `main.ts`: prefijo global `api` + `ValidationPipe` con `whitelist`, `forbidNonWhitelisted` y `transform`.

#### Cobertura actual

- `test/app.e2e-spec.ts` — health: `GET /api/health`.
- `test/users.e2e-spec.ts` — usuarios: `POST /api/users` y `GET /api/users/:id`.
- `test/auth.e2e-spec.ts` — autenticación: `POST /api/auth/login` y `GET /api/auth/me`.
- `test/contests.e2e-spec.ts` — concursos: CRUD de concursos por organización y permisos por rol.
- `test/bands.e2e-spec.ts` — bandas: CRUD de bandas, gestión de miembros y permisos por rol.


