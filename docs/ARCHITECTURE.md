# Architecture

## Stack

- Node.js
- TypeScript
- NestJS
- Prisma
- PostgreSQL
- Docker

## Estructura

El backend se organiza mediante módulos de NestJS.

Cada módulo debe agrupar la funcionalidad de una única área del dominio.

Ejemplo:

```text
src/
+-- auth/
+-- users/
+-- organizations/
+-- bands/
+-- contests/
+-- prisma/
+-- app.module.ts
```

## Capas

La estructura debe separar responsabilidades:

Controller
    ?
Service
    ?
Prisma / Repository
    ?
PostgreSQL

## Controllers

Responsables de:

HTTP.
Rutas.
DTOs de entrada.
Respuestas HTTP.

No deben contener lógica de negocio compleja.

## Services

Contienen la lógica de negocio.

Deben validar reglas, permisos y estados antes de modificar datos.

## Prisma / Repositories

Responsables del acceso a datos.

No se debe acceder directamente a PostgreSQL desde los controllers.

## DTOs

Los datos recibidos por HTTP deben validarse mediante DTOs.

Se utilizará:

class-validator
class-transformer

La validación del backend es obligatoria.

## Autenticación

La autenticación utiliza:

JWT
Passport

Los endpoints protegidos deben utilizar Guards.

La identidad del usuario autenticado debe obtenerse del token y no de datos
enviados por el cliente.

## Autorización

La autorización es contextual.

Debe comprobar:

Usuario autenticado.
Organización correspondiente.
Rol del usuario.
Acceso al recurso.
Acción permitida.

Nunca confiar únicamente en un organizationId enviado por el cliente.

## Multi-tenant

La aplicación utiliza aislamiento lógico entre organizaciones.

Los recursos pertenecientes a una organización deben filtrarse y validarse
siempre mediante su contexto organizativo.

Un usuario no debe poder acceder a recursos de otra organización modificando
un ID en la petición.

## Base de datos

Prisma gestiona el acceso a PostgreSQL.

Los cambios de estructura se realizan mediante migraciones.

No modificar manualmente la estructura de la base de datos en desarrollo.

La base de datos de E2E debe estar separada de la base de datos de desarrollo.

## Testing

Los tests E2E utilizan una base de datos independiente.

Comando principal:

docker compose exec api npm run test:e2e

Los cambios funcionales importantes deben incluir tests.

## Principios

Mantener módulos independientes.
Evitar lógica de negocio en controllers.
Validar siempre en backend.
Aplicar autorización antes de acceder a recursos.
Mantener las transacciones e integridad de datos.
Evitar sobreingeniería.
No romper tests existentes.