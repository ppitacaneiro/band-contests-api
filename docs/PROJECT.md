# Band Contests Platform

## Visión

Band Contests es una plataforma SaaS para crear y gestionar concursos de
bandas musicales.

Permite que diferentes organizaciones (festivales, asociaciones, ayuntamientos,
productoras, escuelas, etc.) gestionen sus propios concursos.

El flujo principal es:

Usuario ? Organización ? Concurso ? Bandas ? Votación ? Resultados

---

## Objetivo del MVP

El MVP debe permitir:

- Registro y autenticación de usuarios.
- Creación y gestión de organizaciones.
- Gestión de miembros y permisos.
- Creación y gestión de concursos.
- Gestión de bandas.
- Inscripción de bandas.
- Gestión de jurados.
- Votación del jurado.
- Votación popular.
- Control antifraude básico.
- Cálculo y publicación de resultados.

---

## Roles

Los roles son contextuales.

### Plataforma

- ADMIN

### Organización

- OWNER
- ADMIN
- MANAGER
- EDITOR

### Concurso

- JURADO

### Banda

- OWNER
- MANAGER

Un usuario puede pertenecer a varias organizaciones y tener diferentes roles
en cada una.

---

## Módulos principales

- Users
- Auth
- Organizations
- Organization Members
- Bands
- Band Members
- Contests
- Contest Registrations
- Contest Jury
- Jury Voting
- Public Voting
- Vote Security
- Contest Results
- Audit Logs

---

## Reglas principales

- Una organización puede tener múltiples concursos.
- Una banda puede participar en múltiples concursos.
- Una banda solo puede tener una inscripción por concurso.
- Un jurado solo puede votar en concursos a los que está asignado.
- Un jurado solo puede valorar una vez cada banda dentro de un concurso.
- Un usuario solo puede emitir un voto público por concurso.
- Los votos públicos requieren usuario autenticado y email verificado.
- Los datos de una organización deben estar aislados de otras organizaciones.
- La autorización debe comprobarse siempre en backend.
- No se debe confiar en `organizationId` enviado por el cliente.

---

## Votación

Los concursos pueden utilizar:

- JURY
- PUBLIC
- MIXED

En `MIXED` se combinan las puntuaciones del jurado y del público mediante
pesos configurables.

---

## Estados

Los concursos seguirán un ciclo de vida controlado:

`DRAFT ? PUBLISHED ? OPEN ? VOTING ? CLOSED ? FINISHED`

Las inscripciones pueden ser:

`PENDING ? ACCEPTED | REJECTED`

---

## Stack

- Node.js
- TypeScript
- NestJS
- Prisma
- PostgreSQL
- Docker
- JWT
- Passport
- bcrypt
- Jest
- Supertest

---

## Testing

Las funcionalidades importantes deben tener tests unitarios y/o E2E.

Los tests E2E utilizan una base de datos independiente de desarrollo.

Nunca deben modificar la base de datos `public`.

Comando principal:

```bash
docker compose exec api npm run test:e2e
```

---

## Principios

Backend como fuente de verdad.
Seguridad y autorización desde backend.
Integridad de datos.
Código mantenible.
Separación de responsabilidades.
Tests automatizados.
Evitar sobreingeniería.

---

## Estado actual

Módulos existentes:

Users
Auth
Organizations
Prisma
Health

JWT y tests E2E están funcionando.

El desarrollo debe continuar de forma incremental sin romper los tests
existentes.

---

## Regla para agentes

Este documento define la visión general del proyecto.

Para detalles de arquitectura, modelo de datos, API, testing o reglas de
negocio, consultar los documentos específicos de docs/.

No inventar funcionalidades ni modificar reglas de negocio importantes sin
justificación.
