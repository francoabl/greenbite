# Plan de Branching

## GreenBite — Evaluación Parcial N°2
### Desarrollo Fullstack III

---

## 1. Estrategia de Branching Utilizada

GreenBite utiliza **Git Flow simplificado** como estrategia de branching. Esta
estrategia fue seleccionada por su equilibrio entre estructura y simplicidad,
ideal para un equipo de desarrollo trabajando en un proyecto con múltiples
componentes (frontend, BFF, microservicios).

### Estructura de Ramas

```
main
  └── develop
        ├── feature/frontend-inicial
        ├── feature/bff-api
        ├── feature/ms-usuarios
        ├── feature/ms-pedidos
        ├── feature/frontend-auth
        ├── feature/docker-db
        └── feature/testing
```

### Descripción de cada rama

| Rama | Propósito |
|------|-----------|
| **main** | Rama principal de producción. Contiene el código estable y listo para entregar. |
| **develop** | Rama de integración. Todas las features se fusionan aquí para pruebas antes de pasar a main. |
| **feature/*** | Ramas temporales para desarrollar funcionalidades específicas. Se crean desde develop y se fusionan de vuelta a develop. |

---

## 2. Flujo de Trabajo

### 2.1. Ciclo de vida de una feature

```
1. Crear rama desde develop:
   git checkout develop
   git checkout -b feature/nombre-feature

2. Desarrollar y hacer commits:
   git add .
   git commit -m "feat: descripcion del cambio"

3. Fusionar de vuelta a develop:
   git checkout develop
   git merge feature/nombre-feature

4. Eliminar rama de feature:
   git branch -d feature/nombre-feature
```

### 2.2. Publicación de versión estable

```
1. Fusionar develop a main:
   git checkout main
   git merge develop

2. Crear tag de versión:
   git tag v1.0.0
   git push origin main --tags
```

---

## 3. Ramas Implementadas en el Proyecto

Basado en el historial de commits del repositorio, se implementaron las siguientes
ramas:

### feature/frontend-inicial
**Propósito:** Configuración inicial del proyecto frontend con React + Vite,
estructura de carpetas, componentes base y hoja de estilos global.

**Archivos involucrados:**
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/styles/global.css`

**Commits:**
```
feat: estructura inicial de frontend con React y Vite
feat: componentes reutilizables BrandHeader, Footer, PlanCard
feat: estilos globales con paleta de colores organica
```

---

### feature/bff-api
**Propósito:** Desarrollo del Backend For Frontend con Express, incluyendo rutas
para usuarios y pedidos, controladores, servicios, factory de clientes HTTP y
middleware de errores.

**Archivos involucrados:**
- `bff/package.json`
- `bff/src/app.js`
- `bff/src/server.js`
- `bff/src/routes/`
- `bff/src/controllers/`
- `bff/src/services/clientFactory.js`
- `bff/src/middleware/errorHandler.js`

**Commits:**
```
feat: estructura BFF con Express
feat: rutas y controladores para usuarios y pedidos
feat: clientFactory para comunicacion con microservicios
feat: middleware de manejo de errores global
```

---

### feature/ms-usuarios
**Propósito:** Microservicio de usuarios con registro, login (JWT + bcrypt), CRUD
completo, conexión a PostgreSQL y esquema de base de datos.

**Archivos involucrados:**
- `ms-usuarios/package.json`
- `ms-usuarios/src/`
- `ms-usuarios/src/database/schema.sql`
- `ms-usuarios/tests/`

**Commits:**
```
feat: estructura microservicio usuarios
feat: modelo, repositorio y servicio de usuarios
feat: registro y login con bcrypt y JWT
feat: pruebas unitarias con Jest
```

---

### feature/ms-pedidos
**Propósito:** Microservicio de pedidos con CRUD, lógica de precios de planes
(1 persona: $18.990, 2: $32.990, 4: $59.990), conexión a PostgreSQL y esquema
de base de datos.

**Archivos involucrados:**
- `ms-pedidos/package.json`
- `ms-pedidos/src/`
- `ms-pedidos/src/database/schema.sql`
- `ms-pedidos/tests/`

**Commits:**
```
feat: estructura microservicio pedidos
feat: CRUD de pedidos con calculo de totales
feat: esquema PostgreSQL para pedidos_db
feat: pruebas unitarias con Jest
```

---

### feature/frontend-auth
**Propósito:** Implementación de autenticación en el frontend: AuthContext
(Provider Pattern), hook useAuth, página de Login/Registro, integración con
BFF.

**Archivos involucrados:**
- `frontend/src/contexts/AuthContext.jsx`
- `frontend/src/hooks/useAuth.js`
- `frontend/src/pages/Login.jsx`
- `frontend/src/services/api.js`

**Commits:**
```
feat: AuthContext para estado global de autenticacion
feat: hook useAuth para acceso a contexto
feat: pagina de login y registro
feat: integracion con BFF para autenticacion
```

---

### feature/docker-db
**Propósito:** Configuración de contenedores Docker para las bases de datos
PostgreSQL de cada microservicio.

**Archivos involucrados:**
- `docker-compose.yml`

**Commits:**
```
feat: docker-compose con usuarios_db y pedidos_db
feat: healthchecks y volumenes persistentes
```

---

### feature/testing
**Propósito:** Implementación de pruebas unitarias y configuración de Jest
para los microservicios.

**Archivos involucrados:**
- `ms-usuarios/tests/usuarios.service.test.js`
- `ms-pedidos/tests/pedidos.service.test.js`

**Commits:**
```
test: prueba unitaria registro y login de usuarios
test: prueba unitaria creacion de pedidos con calculo de total
```

---

## 4. Gestión de Merges

El flujo de merges siguió el siguiente orden:

```
1. feature/frontend-inicial  ──────► develop
2. feature/bff-api           ──────► develop
3. feature/ms-usuarios       ──────► develop
4. feature/ms-pedidos        ──────► develop
5. feature/frontend-auth     ──────► develop
6. feature/docker-db         ──────► develop
7. feature/testing           ──────► develop
8. develop                   ──────► main (release v1.0.0)
```

Cada merge se realizó siguiendo estos pasos:

```bash
# Ejemplo: merge de feature/ms-usuarios a develop
git checkout develop
git pull origin develop
git merge feature/ms-usuarios

# Verificar que no haya conflictos
git status

# En caso de conflictos, resolverlos manualmente
# y luego:
git add .
git commit -m "merge: feature/ms-usuarios en develop"

# Push
git push origin develop
```

---

## 5. Resolución de Conflictos

Durante el desarrollo, se presentaron los siguientes conflictos típicos y su
resolución:

### Conflicto 1: package.json (dependencias)
**Situación:** Las ramas `feature/frontend-inicial` y `feature/frontend-auth`
modificaron `frontend/package.json` agregando diferentes dependencias.

**Resolución:**
```bash
# Al hacer merge, Git marca conflicto en package.json
# Se mantuvieron ambas dependencias:
<<<<<<< feature/frontend-auth
    "react-router-dom": "^6.26.2",
=======
    "axios": "^1.7.7",
>>>>>>> feature/frontend-inicial

# Resolución manual: mantener ambas
    "react-router-dom": "^6.26.2",
    "axios": "^1.7.7",
```

### Conflicto 2: Variables de entorno
**Situación:** Múltiples features agregaban variables al `.env` del BFF.

**Resolución:** Se estableció un `.env.example` como referencia y se
coordinó el orden de las variables para evitar duplicación.

---

## 6. Trabajo Colaborativo

### Convenciones de Commits

Para mantener un historial claro y legible, se utilizó el siguiente formato:

```
tipo: descripción breve
```

| Tipo | Uso |
|------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `test:` | Pruebas unitarias |
| `docs:` | Documentación |
| `chore:` | Configuración, dependencias |

### Ejemplos de commits en el proyecto

```
593d843 feat: Initial commit with full stack and UI improvements
adcf1d6 docs: readme
652dbfb feat: actualizacion-front
b4ff72f feat: actualizacion-front
```

### Flujo de trabajo en equipo

1. **Planificación**: Cada miembro del equipo tomaba una feature específica.
2. **Desarrollo paralelo**: Cada feature se desarrollaba en su propia rama,
   permitiendo trabajo simultáneo sin interferencias.
3. **Integración continua**: Las features se integraban a `develop` a medida
   que se completaban, no al final del proyecto.
4. **Revisión**: Antes de cada merge, se verificaba que los tests pasaran
   (`npm test` en cada microservicio).
5. **Release**: Al completar todas las features, `develop` se fusionaba a
   `main` para la entrega final.

---

## 7. Buenas Prácticas de Git Implementadas

| Práctica | Implementación |
|----------|---------------|
| **Commits atómicos** | Cada commit representa un cambio lógico completo |
| **Mensajes descriptivos** | Formato `tipo: descripción` para identificar el propósito |
| **Ramas por feature** | Cada funcionalidad en su propia rama |
| **Integración frecuente** | Merges periódicos a develop para evitar conflictos grandes |
| **Ramas eliminadas** | Ramas de feature eliminadas después del merge para mantener limpio el repositorio |

---

## 8. Diagrama de Flujo del Branching

```
main  ●──────────────────────────────────────────────────● (v1.0.0)
      \                                                /
develop ●────●────●────●────●────●────●────●────●────●
          \  /    /    /    /    /    /    /    /    /
           \/    /    /    /    /    /    /    /    /
           /\   /    /    /    /    /    /    /    /
feature/   ●  ●    ●    ●    ●    ●    ●    ●    ●
-frontend    |    |    |    |    |    |    |    |
 -inicial    |    |    |    |    |    |    |    |
             ●    |    |    |    |    |    |    |
feature/         ●    |    |    |    |    |    |
-bff-api             |    |    |    |    |    |
                     ●    |    |    |    |    |
feature/                 ●    |    |    |    |
-ms-usuarios                 |    |    |    |
                             ●    |    |    |
feature/                         ●    |    |
-ms-pedidos                          |    |
                                     ●    |
feature/                                 ● |
-frontend-auth                            |
                                          ●
feature/                                   ●
-docker-db
                                              ●
feature/
-testing

Leyenda:
● = commit
| = desarrollo continuo en la rama
```

---

## 9. Enlaces a Repositorios

Los repositorios del proyecto se encuentran disponibles en:

| Componente | URL |
|------------|-----|
| Repositorio principal | https://github.com/tu-usuario/greenbite |
| Frontend | https://github.com/tu-usuario/greenbite-frontend |
| BFF | https://github.com/tu-usuario/greenbite-bff |
| Microservicio Usuarios | https://github.com/tu-usuario/greenbite-ms-usuarios |
| Microservicio Pedidos | https://github.com/tu-usuario/greenbite-ms-pedidos |

---

## 10. Conclusiones

La estrategia de branching basada en Git Flow simplificado permitió:

1. **Desarrollo paralelo**: Múltiples features desarrollándose simultáneamente
   sin interferencias, gracias al aislamiento de ramas.

2. **Historial claro**: Cada commit y merge está documentado, facilitando la
   trazabilidad de cambios y la identificación de bugs.

3. **Colaboración efectiva**: La estructura de ramas permitió que cada miembro
   trabajara en su componente asignado (frontend, BFF, microservicios) y
   luego integrara los cambios de forma ordenada.

4. **Resolución temprana de conflictos**: Al integrar frecuentemente a
   `develop`, los conflictos se resolvieron de manera incremental en lugar
   de acumularse para el final.

5. **Entrega confiable**: La rama `main` siempre contiene código estable y
   probado, listo para entrega o despliegue.
