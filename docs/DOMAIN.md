# Domain

## Conceptos principales

El dominio de Band Contests se organiza alrededor de:

```text
User
  ?
Organization
  ?
Contest
  ?
Band
  ?
Voting
  ?
Results
```

## User

Usuario global de la plataforma.

Un usuario puede:

- Pertenecer a varias organizaciones.
- Gestionar una o varias bandas.
- Ser jurado de determinados concursos.
- Participar como público.

Los roles no deben almacenarse como un único role en User.

## Organization

Entidad que organiza concursos.

Una organización puede tener:

- Múltiples usuarios.
- Múltiples concursos.

El usuario que crea una organización se convierte en OWNER.

Organization Member

Relaciona un usuario con una organización.

Roles:

OWNER
ADMIN
MANAGER
EDITOR

El rol pertenece a la relación, no al usuario.

Un usuario puede tener diferentes roles en diferentes organizaciones.

## Band

Grupo musical participante.

Una banda puede:

- Tener varios miembros.
- Participar en múltiples concursos.
- Tener diferentes inscripciones.
- Band Member

Relaciona usuarios con bandas.

Roles:

OWNER
MANAGER

Una banda debe tener al menos un usuario con capacidad de gestión.

## Contest

Concurso organizado por una organización.

Un concurso pertenece a una única organización.

Una organización puede tener múltiples concursos.

Estados:

DRAFT
  ?
PUBLISHED
  ?
OPEN
  ?
VOTING
  ?
CLOSED
  ?
FINISHED

Modalidades de votación:

JURY
PUBLIC
MIXED
Contest Registration

Representa la inscripción de una banda en un concurso.

Estados:

PENDING
  ?
ACCEPTED
  ?
REJECTED

Una banda solo puede tener una inscripción en un mismo concurso.

Solo las inscripciones ACCEPTED representan participantes oficiales.

## Contest Jury

Relaciona un usuario con un concurso como jurado.

El rol de jurado es contextual al concurso.

Un usuario solo puede actuar como jurado en concursos a los que haya sido
asignado.

## Jury Vote

Valoración realizada por un jurado sobre una banda.

La puntuación prevista es:

0 - 100

Un jurado solo puede realizar una valoración por banda dentro de un concurso.

Una valoración existente puede modificarse.

## Public Vote

Voto realizado por un usuario registrado.

Requisitos:

Usuario autenticado.
Email verificado.
Concurso abierto a votación.
Usuario no ha votado previamente.

Regla principal:

1 usuario = 1 voto por concurso
Vote Security

Información relacionada con la detección de votos sospechosos.

Puede registrar:

IP.
User Agent.
Dispositivo.
Sesión.
Fecha.
País.
Nivel de riesgo.

Estados del voto:

VALID
PENDING_REVIEW
BLOCKED

El antifraude del MVP utiliza reglas sencillas y trazabilidad.

## Contest Result

Resultado calculado de un concurso.

Puede contener:

Posición.
Puntuación del jurado.
Puntuación pública.
Puntuación final.
Número de votos.
Estado de publicación.

Un resultado calculado no implica que esté publicado.

## Audit Log

Registra operaciones relevantes realizadas en el sistema.

Ejemplos:

CREATE_CONTEST
UPDATE_CONTEST
PUBLISH_CONTEST
ACCEPT_BAND
REJECT_BAND
ASSIGN_JURY
BLOCK_VOTE
PUBLISH_RESULTS

Su objetivo es proporcionar trazabilidad.

Relaciones principales
User
 +-- Organization Member ? Organization
 +-- Band Member ? Band
 +-- Contest Jury ? Contest


Organization
 +-- Contest


Contest
 +-- Contest Registration ? Band
 +-- Contest Jury ? User
 +-- Jury Vote ? Band
 +-- Public Vote ? User
 +-- Contest Result ? Band

## Reglas de dominio

Los roles son contextuales.
Los recursos de una organización deben permanecer aislados.
Una banda puede participar en múltiples concursos.
Una banda no puede inscribirse dos veces en el mismo concurso.
Un jurado solo puede votar en concursos asignados.
Un jurado solo puede valorar una vez cada banda por concurso.
Un usuario solo puede votar una vez públicamente por concurso.
Las reglas de negocio deben validarse en backend.
Las restricciones críticas de integridad deben reforzarse también en la base de datos.