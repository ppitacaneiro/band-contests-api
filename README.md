docker compose up -d
# Band Contests API

API REST para la plataforma SaaS de concursos de bandas musicales.

## Resumen

API backend desarrollado con NestJS, TypeScript y Prisma para PostgreSQL. Proporciona autenticación mediante JWT y funcionalidad para gestionar usuarios y organizaciones.

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

Si quieres, puedo:

- Añadir ejemplos de curl para endpoints.
- Incluir un diagrama mermaid del flujo de autenticación.
- Añadir sección de pruebas e2e existentes (`test/`).

Authorization: Bearer JWT
   │
   ▼
OrganizationsController
   │
   ▼
@CurrentUser()
   │
   ▼
OrganizationsService
   │
   ▼
OrganizationsRepository
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
12. Autorización por organización

La autenticación y la autorización son conceptos diferentes.

Autenticación

Responde a:

¿Quién eres?

Se resuelve mediante JWT.

Autorización

Responde a:

¿Qué puedes hacer?

En este proyecto existen dos niveles de permisos:

Rol global
ADMIN
ORGANIZER
JURY
BAND
Rol dentro de una organización
OWNER
ADMIN
MEMBER

Por ejemplo:

Carlos
│
├── Organización A
│   └── OWNER
│
└── Organización B
    └── MEMBER

El usuario puede tener permisos diferentes dependiendo de la organización.

La siguiente parte de la implementación debe ser precisamente reforzar esta autorización.

13. Próximos pasos

Orden previsto:

1. Autorización por organización
2. Guards / decorators para roles
3. Organizaciones
4. Concursos
5. Bandas
6. Inscripción de bandas
7. Jurado
8. Votaciones del jurado
9. Votación pública
10. Resultados

La arquitectura debe mantenerse modular para que cada funcionalidad tenga su propio módulo:

auth/
users/
organizations/
contests/
bands/
registrations/
jury/
votes/
results/

Cada módulo seguirá, cuando corresponda, la estructura:

Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma