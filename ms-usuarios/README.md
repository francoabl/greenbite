# MS Usuarios (Spring Boot) 🌱

Microservicio de **autenticación y gestión de usuarios** de GreenBite.
Migrado de Node.js/Express a **Java 17 + Spring Boot 3.5** con persistencia **JPA/Hibernate** sobre PostgreSQL.

- Puerto: `4001`
- Base de datos: `usuarios_db` (PostgreSQL, puerto `5433`)
- Patrón: *Database per Service*

## Tecnologías
- Spring Web (API REST)
- Spring Data JPA + Hibernate (persistencia)
- PostgreSQL Driver
- Spring Security Crypto (BCrypt para hashear contraseñas)
- jjwt (generación de tokens JWT)
- JUnit 5 + Mockito (pruebas unitarias)
- JaCoCo (reporte de cobertura)

## Requisitos
- **JDK 17** (`java -version` debe mostrar 17).
- **Docker** para la base de datos (ver `docker-compose.yml` en la raíz).
- No necesitas instalar Maven: el proyecto incluye el **Maven Wrapper** (`mvnw` / `mvnw.cmd`).

## Configuración
Variables (con valores por defecto en `src/main/resources/application.properties`):

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `4001` | Puerto HTTP |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5433/usuarios_db` | URL **JDBC** de PostgreSQL |
| `DB_USER` | `postgres` | Usuario de BD |
| `DB_PASSWORD` | `postgres` | Password de BD |
| `JWT_SECRET` | `dev_secret_dev_secret_dev_secret_123456` | Secreto para firmar JWT (mín. 32 caracteres) |

> Las tablas se crean automáticamente con `spring.jpa.hibernate.ddl-auto=update`.

## Ejecutar
```powershell
# 1. Levantar la base de datos (desde la raíz del proyecto)
docker compose up -d

# 2. Ejecutar el microservicio
cd ms-usuarios
.\mvnw.cmd spring-boot:run      # Windows
./mvnw spring-boot:run          # Linux/Mac
```

## Probar (pruebas unitarias + cobertura)
```powershell
.\mvnw.cmd test
```
El reporte de cobertura JaCoCo queda en:
```
target/site/jacoco/index.html
```

## Documentación Swagger / OpenAPI
Con el servicio levantado:
- Swagger UI: http://localhost:4001/swagger-ui.html
- Especificación JSON: http://localhost:4001/v3/api-docs

## API REST
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servicio |
| `POST` | `/usuarios/register` | Registrar usuario → `{ user, token }` |
| `POST` | `/usuarios/login` | Iniciar sesión → `{ user, token }` |
| `GET` | `/usuarios` | Listar usuarios → `{ items: [...] }` |
| `GET` | `/usuarios/{id}` | Obtener usuario por id |
| `PUT` | `/usuarios/{id}` | Actualizar usuario |
| `DELETE` | `/usuarios/{id}` | Eliminar usuario → `{ ok: true }` |

### Ejemplo
```bash
curl -X POST http://localhost:4001/usuarios/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","email":"ana@greenbite.cl","password":"secret"}'
```
