# GreenBite - Evaluación Parcial N°2
## Desarrollo Fullstack III

# Objetivo del proyecto

Desarrollar una arquitectura basada en microservicios para la plataforma GreenBite, implementando componentes frontend y backend desacoplados, aplicando patrones de diseño, patrones arquitectónicos y estrategia de branching utilizando Git.

GreenBite es una empresa que ofrece un servicio de suscripción de alimentos orgánicos mediante una plataforma digital. cada suscripcion tiene un canasta de alimentos adecuados por ejemplo suscripcion 1 persona valor adecuado al mercado chileno
para 2 persona valor adecuado al mercado chileno
para 4 persona valor adecuado al mercado chileno

El proyecto debe cumplir con todos los requerimientos de la pauta de Evaluación Parcial N°2.

---

# Arquitectura general

```txt
Frontend React
       ↓
       BFF
    ↙      ↘
Usuarios   Pedidos
    ↓          ↓
usuarios_db  pedidos_db
```

---

# Requerimientos obligatorios

## Frontend

Tecnologías:
- React
- Vite
- npm

Requisitos:
- package.json configurado
- estructura organizada
- README.md
- componentes reutilizables
- consumo de APIs del BFF
- uso de patrones de diseño

Estructura esperada:

```txt
frontend/
 ├── src/
 ├── public/
 ├── package.json
 ├── vite.config.js
 └── README.md
```

---

# Backend

Tecnologías:
- Node.js
- Express.js
- Arquitectura basada en microservicios

Se deben implementar:

## 1. Backend For Frontend (BFF)

Responsabilidades:
- punto de entrada para frontend
- centralizar requests
- consumir microservicios
- simplificar respuestas al frontend

Ejemplo:

```txt
frontend → BFF → microservicios
```

Estructura esperada:

```txt
bff/
 ├── src/
 ├── routes/
 ├── controllers/
 ├── services/
 ├── package.json
 └── README.md
```

---

## 2. Microservicio Usuarios

Responsabilidades:
- registro usuarios
- login
- CRUD usuarios
- autenticación básica

Base de datos:
- usuarios_db

NO debe acceder a bases de datos externas.

Estructura:

```txt
ms-usuarios/
 ├── src/
 ├── routes/
 ├── controllers/
 ├── models/
 ├── services/
 ├── database/
 ├── package.json
 └── README.md
```

---

## 3. Microservicio Pedidos

Responsabilidades:
- CRUD pedidos
- listar pedidos
- actualizar estado

Base de datos:
- pedidos_db

NO debe acceder a bases de datos externas.

Estructura:

```txt
ms-pedidos/
 ├── src/
 ├── routes/
 ├── controllers/
 ├── models/
 ├── services/
 ├── database/
 ├── package.json
 └── README.md
```

---

# Patrón arquitectónico obligatorio

## Database per Service

Cada microservicio debe tener su propia base de datos independiente.

Ejemplo correcto:

```txt
ms-usuarios → usuarios_db
ms-pedidos → pedidos_db
```

NO utilizar una base de datos compartida.

Los microservicios deben comunicarse mediante APIs HTTP REST.

---

# Comunicación entre servicios

La comunicación debe realizarse mediante:
- HTTP REST
- fetch o axios

Ejemplo:

```txt
BFF → ms-usuarios
BFF → ms-pedidos
```

---

# Patrones de diseño obligatorios

Implementar mínimo 3 patrones de diseño reales.

## Patrones recomendados

### Frontend

## 1. Provider Pattern

Uso:
- manejo de autenticación
- manejo de estado global

Ejemplo:
- AuthProvider

---

## 2. Custom Hooks

Uso:
- reutilización de lógica

Ejemplo:
- useAuth()
- usePedidos()

---

### Backend

## 3. Repository Pattern

Uso:
- separación acceso a datos
- mantenibilidad

---

## 4. Singleton Pattern

Uso:
- conexión base de datos

---

## 5. Factory Pattern

Uso:
- creación de servicios o conexiones

---

# IMPORTANTE

No solo implementar los patrones.

También:
- justificar por qué se usan
- explicar qué problema resuelven
- explicar cómo mejoran mantenibilidad y escalabilidad

---

# Base de datos

Tecnología recomendada:
- PostgreSQL
o
- MySQL

Bases requeridas:

```txt
usuarios_db
pedidos_db
```

---

# Buenas prácticas obligatorias

El código debe:
- estar ordenado
- modularizado
- separado por responsabilidades
- evitar lógica repetida
- utilizar variables claras
- utilizar controladores y servicios separados

---

# Pruebas unitarias

Implementar pruebas básicas.

Backend:
- Jest recomendado

Frontend:
- Vitest opcional

Ejemplos:
- test login
- test creación pedido
- test servicios

---

# Estrategia de branching obligatoria

Utilizar Git con ramas.

Estructura recomendada:

```txt
main
develop
feature/*
```

Ejemplos:

```txt
feature/login
feature/pedidos
feature/frontend-auth
```

Debe existir evidencia de:
- commits
- merges
- pull requests
- resolución de conflictos

---

# Repositorios GitHub

Crear:
- repositorio principal
- repositorios separados opcionalmente

Debe existir:

```txt
repositorios.txt
```

Con:
- links GitHub
- descripción de cada repositorio

---

# Documentación obligatoria

## Documento PDF
### Análisis de Patrones y Arquetipos

Debe incluir:
- patrones implementados
- justificación
- problemas resueltos
- ventajas obtenidas

---

## Documento PDF
### Plan de Branching

Debe incluir:
- estrategia Git utilizada
- ramas
- merges
- trabajo colaborativo
- conflictos resueltos

---

# README.md obligatorio en cada proyecto

Cada componente debe explicar:
- instalación
- dependencias
- ejecución
- pruebas

Ejemplo:

```bash
npm install
npm run dev
```

---

# Endpoints sugeridos

## Usuarios

```txt
POST /usuarios/register
POST /usuarios/login
GET /usuarios
GET /usuarios/:id
PUT /usuarios/:id
DELETE /usuarios/:id
```

---

## Pedidos

```txt
POST /pedidos
GET /pedidos
GET /pedidos/:id
PUT /pedidos/:id
DELETE /pedidos/:id
```

---

# Tecnologías recomendadas

## Frontend
- React
- Vite
- Axios
- React Router

## Backend
- Node.js
- Express.js
- Axios
- JWT
- dotenv

## Base de datos
- PostgreSQL
o
- MySQL

## Testing
- Jest
- Supertest

---

# Objetivos técnicos

El sistema debe demostrar:
- escalabilidad
- mantenibilidad
- desacoplamiento
- separación de responsabilidades
- arquitectura basada en microservicios

---

# Defensa oral

Todos los integrantes deben poder explicar:

## Arquitectura
- por qué microservicios
- por qué BFF
- por qué Database per Service

## Patrones
- cuáles usaron
- qué problema resuelven

## Git
- branching
- merges
- conflictos

## Buenas prácticas
- mantenibilidad
- modularidad
- pruebas unitarias

---

# Entrega final

Entregar archivo ZIP/RAR con:

```txt
proyecto/
 ├── frontend/
 ├── bff/
 ├── ms-usuarios/
 ├── ms-pedidos/
 ├── docs/
 │    ├── patrones.pdf
 │    ├── branching.pdf
 │    └── repositorios.txt
```

---

# Reglas importantes

- NO compartir bases de datos entre microservicios
- NO acceder directamente a la base de datos de otro servicio
- TODO acceso debe hacerse mediante API REST
- Implementar mínimo 3 patrones reales
- Mantener código limpio y organizado
- Utilizar Git correctamente
- Documentar todo

