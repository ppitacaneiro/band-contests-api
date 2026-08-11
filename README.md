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