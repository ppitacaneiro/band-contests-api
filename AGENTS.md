# Band Contests API

## Proyecto

API backend para una plataforma SaaS de concursos musicales.

## Stack

- Node.js
- TypeScript
- NestJS
- Prisma
- PostgreSQL
- Docker / Docker Compose
- JWT
- bcrypt
- Jest
- Supertest

## Arquitectura

Aplicación NestJS modular.

Cada módulo debe separar:

- Controller
- Service
- Repository
- DTO
- Tests

Los controllers no deben contener lógica de negocio.

Los services contienen la lógica de negocio.

Los repositories son responsables del acceso a Prisma.

## Autenticación

La autenticación utiliza JWT.

Los endpoints protegidos utilizan JwtAuthGuard.

El usuario autenticado se obtiene mediante CurrentUser decorator.

## Organizaciones

Un usuario puede pertenecer a múltiples organizaciones.

OrganizationUser representa la relación entre User y Organization.

OrganizationUser tiene un role.

La creación de una organización crea automáticamente una relación
OrganizationUser con role OWNER.

## Slugs

Los slugs se generan en backend.

Nunca deben ser generados por el frontend.

Ejemplo:

Band Galicia
→ band-galicia

Si existe:

Band Galicia
→ band-galicia-2

## Tests

Los unit tests utilizan mocks.

Los E2E utilizan PostgreSQL real.

Los E2E utilizan el schema:

test_e2e

Nunca modificar ni truncar el schema public durante los tests E2E.

El comando oficial para ejecutar E2E es:

docker compose exec api npm run test:e2e

## Reglas importantes

- No modificar código sin entender primero la arquitectura existente.
- No introducir dependencias innecesarias.
- No duplicar lógica.
- Mantener TypeScript estrictamente tipado.
- Crear tests para nueva lógica de negocio.
- Crear o actualizar tests E2E para nuevos endpoints importantes.
- No modificar public durante los tests E2E.
- Antes de cambiar arquitectura, explicar primero la propuesta.
- Mantener los controllers delgados.