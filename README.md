# GreenBite 🌱

Plataforma de suscripciones de comida orgánica basada en una arquitectura de microservicios con un patrón de Base de Datos por Servicio (Database per Service) y un Backend For Frontend (BFF).

![GreenBite — interfaz web](docs/img/greenbite-home.png)

## Arquitectura del Proyecto

El sistema está dividido en los siguientes componentes, aplicando **distintos lenguajes y tecnologías** por capa:
- **Frontend (React + Vite):** Interfaz de usuario (Puerto `5173`).
- **BFF (Node.js + Express):** Orquestador y proxy inverso para el frontend (Puerto `4000`).
- **MS Usuarios (Java 17 + Spring Boot 3.5):** Microservicio de autenticación y gestión de usuarios, persistencia con **JPA/Hibernate** (Puerto `4001`).
- **MS Pedidos (Java 17 + Spring Boot 3.5):** Microservicio para el flujo y registro de suscripciones, persistencia con **JPA/Hibernate** (Puerto `4002`).
- **Bases de Datos:** Dos instancias separadas de PostgreSQL alojadas en Docker (`usuarios_db` en `5433` y `pedidos_db` en `5434`), una por servicio (*Database per Service*).

> Las tablas se crean automáticamente al arrancar cada microservicio (Hibernate `ddl-auto=update`).

![Diagrama de arquitectura de microservicios](docs/diagrama-arquitectura.png)

## Requisitos Previos
- **JDK 17** (para los microservicios Spring Boot). No necesitas instalar Maven: cada microservicio incluye el **Maven Wrapper** (`mvnw`).
- **Node.js** (v18 o superior) y **npm** (para el BFF y el frontend).
- **Docker** y **Docker Compose** (para levantar las bases de datos).

---

## 🚀 Pasos para iniciar el proyecto localmente

### 1. Iniciar las bases de datos
Asegúrate de que Docker esté ejecutándose en tu máquina. Ve a la raíz del proyecto y levanta los contenedores:

```bash
docker compose up -d
```
*Esto iniciará y configurará automáticamente las tablas necesarias usando los scripts de inicialización.*

### 2. Instalar las dependencias de Node (BFF y Frontend)
Los microservicios Spring Boot descargan sus dependencias automáticamente con el Maven Wrapper en la primera ejecución. Solo instala las de Node:

```bash
cd frontend && npm install && cd ..
cd bff && npm install && cd ..
```

### 3. Iniciar los servicios (Modo Desarrollo)
Te recomendamos abrir 4 pestañas de terminal. Los microservicios usan el Maven Wrapper; el BFF y el frontend usan npm:

**Terminal 1 (Microservicio de Usuarios — Spring Boot):**
```powershell
cd ms-usuarios
.\mvnw.cmd spring-boot:run    # Windows  (./mvnw spring-boot:run en Linux/Mac)
```

**Terminal 2 (Microservicio de Pedidos — Spring Boot):**
```powershell
cd ms-pedidos
.\mvnw.cmd spring-boot:run
```

**Terminal 3 (Backend For Frontend - BFF):**
```bash
cd bff
npm run dev
```

**Terminal 4 (Frontend React):**
```bash
cd frontend
npm run dev
```

> Atajo: desde la raíz puedes ejecutar `./iniciar.ps1` (o `iniciar.bat`) para levantar todo automáticamente.

### Pruebas unitarias (JUnit + cobertura JaCoCo)
Cada microservicio se prueba con:
```powershell
cd ms-usuarios   # o ms-pedidos
.\mvnw.cmd test
```
El reporte de cobertura queda en `target/site/jacoco/index.html`.

### 4. Acceso a la aplicación
Una vez que todas las terminales indiquen que los servidores están escuchando, abre tu navegador y visita:

👉 **[http://localhost:5173](http://localhost:5173)**

---

## Documentación y entregables
Toda la documentación está en la carpeta [`docs/`](docs/README.md):
- **Diagrama de arquitectura:** [docs/diagrama-arquitectura.png](docs/diagrama-arquitectura.png)
- **Informe de persistencia (JPA):** [docs/informe-persistencia.docx](docs/informe-persistencia.docx)
- **Informe de pruebas unitarias:** [docs/informe-pruebas-unitarias.docx](docs/informe-pruebas-unitarias.docx)
- **API REST (Swagger/OpenAPI):** [docs/api/README.md](docs/api/README.md) — Swagger UI en `:4001/swagger-ui.html` y `:4002/swagger-ui.html`
- **Análisis de patrones:** [docs/analisis-patrones.md](docs/analisis-patrones.md)

### Documentación de la API con Swagger
Cada microservicio expone su API documentada e interactiva con Swagger UI:

| MS Usuarios (`:4001/swagger-ui.html`) | MS Pedidos (`:4002/swagger-ui.html`) |
|---|---|
| ![Swagger MS Usuarios](docs/img/swagger-usuarios.png) | ![Swagger MS Pedidos](docs/img/swagger-pedidos.png) |

### Pruebas unitarias y cobertura
45 pruebas unitarias (JUnit 5 + Mockito), todas en verde, con cobertura medida por JaCoCo: **ms-usuarios 82.5%** y **ms-pedidos 78.7%** (ambos sobre el mínimo del 60%).

![Cobertura de pruebas unitarias (JaCoCo)](docs/cobertura-chart.png)

| Ejecución ms-usuarios (24 tests) | Ejecución ms-pedidos (21 tests) |
|---|---|
| ![Pruebas ms-usuarios](docs/evidencia/tests-ms-usuarios.png) | ![Pruebas ms-pedidos](docs/evidencia/tests-ms-pedidos.png) |

## Estructura de Repositorios (Git)
Esta solución maneja submódulos/repositorios para separar dominios. Si deseas clonarlo u operar de a partes:
- Repositorio principal: `/greenbite`
- Frontend: `/greenbite-frontend`
- BFF: `/greenbite-bff`
- MS Usuarios: `/greenbite-ms-usuarios`
- MS Pedidos: `/greenbite-ms-pedidos`
