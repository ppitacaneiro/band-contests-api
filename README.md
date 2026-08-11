# Band Contests API

API REST para la plataforma SaaS de concursos de bandas musicales.

## 1. Stack tecnológico

### Backend

- **Node.js**
- **TypeScript**
- **NestJS**
- **Prisma ORM**
- **PostgreSQL**
- **JWT** para autenticación
- **Passport / passport-jwt** para protección de endpoints
- **bcrypt** para hash y validación de contraseñas

### Infraestructura

- **Docker**
- **Docker Compose**

### Herramientas de desarrollo

- npm
- Prisma CLI
- Git

---

## 2. Arquitectura

Se utiliza una arquitectura modular basada en NestJS y separación de responsabilidades.

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

# Controller

Responsable de:

- Recibir las peticiones HTTP.
- Validar DTOs.
- Obtener el usuario autenticado.
- Devolver las respuestas.

Service

Contiene la lógica de negocio.

Ejemplos:

Autenticación.
Generación de slugs.
Creación de organizaciones.
Comprobación de reglas de negocio.
Repository

Abstrae el acceso a datos.

Los repositories utilizan PrismaService para comunicarse con PostgreSQL.

Prisma

Gestiona:

Modelos de datos.
Migraciones.
Consultas a PostgreSQL.
Prisma Client.
3. Estructura del proyecto
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
│
├── users/
│   ├── users.controller.ts
│   ├── users.module.ts
│   ├── users.repository.ts
│   └── users.service.ts
│
├── organizations/
│   ├── dto/
│   │   └── create-organization.dto.ts
│   ├── organizations.controller.ts
│   ├── organizations.module.ts
│   ├── organizations.repository.ts
│   └── organizations.service.ts
│
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── common/
│   └── utils/
│       └── slug.util.ts
│
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
4. Entorno de desarrollo
Requisitos
Docker
Docker Compose
Git

No es necesario instalar PostgreSQL ni Node.js directamente en el sistema si se utiliza el entorno Docker configurado para el proyecto.

Arrancar el proyecto
docker compose up -d

Ver logs de la API:

docker compose logs -f api

La API está disponible en:

http://localhost:3001
5. Servicios Docker
API
api:
  ports:
    - "3001:3001"
PostgreSQL
postgres:
  image: postgres:17-alpine
  ports:
    - "5432:5432"

Datos de desarrollo:

Database: band_contests
User: band_contests
Password: band_contests_dev
Host: postgres
Port: 5432

La API utiliza:

DATABASE_URL=postgresql://band_contests:band_contests_dev@postgres:5432/band_contests?schema=public
6. Prisma

Generar Prisma Client:

docker compose exec api npx prisma generate

Comprobar estado de las migraciones:

docker compose exec api npx prisma migrate status

Crear una migración:

docker compose exec api npx prisma migrate dev --name nombre_migracion

Aplicar migraciones:

docker compose exec api npx prisma migrate deploy

Reiniciar completamente la base de datos durante desarrollo:

docker compose exec api npx prisma migrate reset

migrate reset elimina todos los datos de la base de datos. No utilizar en producción.

7. Modelo de datos actual
User
User
├── id
├── name
├── email
├── password
├── role
├── emailVerifiedAt
├── createdAt
└── updatedAt

Roles globales:

ADMIN
ORGANIZER
JURY
BAND
Organization
Organization
├── id
├── name
├── slug
├── createdAt
└── updatedAt

El slug es único.

Ejemplo:

name: "Festival de Música de Coruña"
slug: "festival-de-musica-de-coruna"

Si el slug ya existe:

festival-de-musica-de-coruna
festival-de-musica-de-coruna-2
festival-de-musica-de-coruna-3

El slug se genera en el backend.

OrganizationUser

Tabla intermedia entre usuarios y organizaciones.

OrganizationUser
├── id
├── userId
├── organizationId
├── role
├── createdAt
└── updatedAt

Roles dentro de una organización:

OWNER
ADMIN
MEMBER

Un usuario puede pertenecer a varias organizaciones.

Una organización puede tener varios usuarios.

Existe una restricción única:

(userId, organizationId)

Por tanto, un usuario no puede pertenecer dos veces a la misma organización.

8. Autenticación

La autenticación utiliza:

JWT + Passport + bcrypt

El usuario realiza login con email y contraseña.

El backend:

Busca el usuario.
Comprueba la contraseña mediante bcrypt.
Genera un JWT.
Devuelve el token.

Ejemplo de respuesta:

{
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": "7d"
}

Las rutas protegidas utilizan:

@UseGuards(JwtAuthGuard)
9. Usuario autenticado

El usuario autenticado está disponible mediante:

@CurrentUser()

Ejemplo:

@Get()
async findMine(
  @CurrentUser() user: AuthenticatedUser,
) {
  return this.organizationsService.findByUserId(user.id);
}

La interfaz utilizada es:

AuthenticatedUser

Actualmente contiene la información necesaria procedente del JWT, incluyendo:

id
email
10. Endpoints

Base URL:

/api
Auth
POST /api/auth/login

Inicia sesión.

Request:

{
  "email": "carlos@example.com",
  "password": "password"
}

Response:

{
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": "7d"
}
Organizations

Todos los endpoints de organizaciones están actualmente protegidos mediante JWT.

Header:

Authorization: Bearer <accessToken>
POST /api/organizations

Crea una organización para el usuario autenticado.

Request:

{
  "name": "Festival de Música de Coruña"
}

El backend genera automáticamente el slug:

festival-de-musica-de-coruna

El usuario autenticado se añade automáticamente como:

OWNER

La creación se realiza mediante una única operación de Prisma que crea:

Organization
└── OrganizationUser
    ├── userId
    └── role = OWNER
GET /api/organizations

Obtiene las organizaciones a las que pertenece el usuario autenticado.

Ejemplo:

GET /api/organizations
Authorization: Bearer <accessToken>

La consulta se realiza utilizando el userId obtenido del JWT.

No se recibe el userId desde el frontend.

GET /api/organizations/:id

Obtiene una organización por su ID.

Ejemplo:

GET /api/organizations/01063a09-e9b1-43c8-8aca-fee2e4e98b5c
Authorization: Bearer <accessToken>

Actualmente este endpoint comprueba el ID de la organización, pero la autorización por pertenencia a la organización debe reforzarse antes de considerarlo terminado.

11. Flujo actual

El flujo implementado hasta ahora es:

Usuario
   │
   ▼
POST /auth/login
   │
   ▼
JWT
   │
   ▼
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