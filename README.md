# GreenBite 🌱

Plataforma de suscripciones de comida orgánica basada en una arquitectura de microservicios con un patrón de Base de Datos por Servicio (Database per Service) y un Backend For Frontend (BFF).

## Arquitectura del Proyecto

El sistema está dividido en los siguientes componentes:
- **Frontend (React + Vite):** Interfaz de usuario (Puerto `5173`).
- **BFF (Node.js + Express):** Orquestador y proxy inverso para el frontend (Puerto `4000`).
- **MS Usuarios:** Microservicio encargado de la autenticación y gestión de usuarios (Puerto `4001`).
- **MS Pedidos:** Microservicio para el flujo y registro de suscripciones (Puerto `4002`).
- **Bases de Datos:** Dos instancias separadas de PostgreSQL alojadas en Docker (`usuarios_db` en `5433` y `pedidos_db` en `5434`).

## Requisitos Previos
- **Node.js** (v18 o superior) y **npm**.
- **Docker** y **Docker Compose** (para levantar las bases de datos).

---

## 🚀 Pasos para iniciar el proyecto localmente

### 1. Iniciar las bases de datos
Asegúrate de que Docker esté ejecutándose en tu máquina. Ve a la raíz del proyecto y levanta los contenedores:

```bash
docker compose up -d
```
*Esto iniciará y configurará automáticamente las tablas necesarias usando los scripts de inicialización.*

### 2. Instalar las dependencias
Debes instalar las dependencias de Node en cada una de las 4 carpetas principales. Abre tu terminal en la raíz del proyecto y ejecuta:

```bash
cd frontend && npm install && cd ..
cd bff && npm install && cd ..
cd ms-usuarios && npm install && cd ..
cd ms-pedidos && npm install && cd ..
```

### 3. Iniciar los servicios (Modo Desarrollo)
Necesitarás levantar cada servicio por separado. Te recomendamos abrir 4 pestañas de terminal y ejecutar el comando `npm run dev` en cada directorio:

**Terminal 1 (Microservicio de Usuarios):**
```bash
cd ms-usuarios
npm run dev
```

**Terminal 2 (Microservicio de Pedidos):**
```bash
cd ms-pedidos
npm run dev
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

### 4. Acceso a la aplicación
Una vez que todas las terminales indiquen que los servidores están escuchando, abre tu navegador y visita:

👉 **[http://localhost:5173](http://localhost:5173)**

---

## Estructura de Repositorios (Git)
Esta solución maneja submódulos/repositorios para separar dominios. Si deseas clonarlo u operar de a partes:
- Repositorio principal: `/greenbite`
- Frontend: `/greenbite-frontend`
- BFF: `/greenbite-bff`
- MS Usuarios: `/greenbite-ms-usuarios`
- MS Pedidos: `/greenbite-ms-pedidos`
