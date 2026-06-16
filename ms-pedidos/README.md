# MS Pedidos (Spring Boot) 🌱

Microservicio de **flujo y registro de suscripciones (pedidos)** de GreenBite.
Migrado de Node.js/Express a **Java 17 + Spring Boot 3.5** con persistencia **JPA/Hibernate** sobre PostgreSQL.

- Puerto: `4002`
- Base de datos: `pedidos_db` (PostgreSQL, puerto `5434`)
- Patrón: *Database per Service*

## Tecnologías
- Spring Web (API REST)
- Spring Data JPA + Hibernate (persistencia)
- PostgreSQL Driver
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
| `PORT` | `4002` | Puerto HTTP |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5434/pedidos_db` | URL **JDBC** de PostgreSQL |
| `DB_USER` | `postgres` | Usuario de BD |
| `DB_PASSWORD` | `postgres` | Password de BD |

> Las tablas se crean automáticamente con `spring.jpa.hibernate.ddl-auto=update`.

### Planes y precios (CLP)
| Plan (semanas) | Total |
|---|---|
| 1 | 18.990 |
| 2 | 32.990 |
| 4 | 59.990 |

## Ejecutar
```powershell
# 1. Levantar la base de datos (desde la raíz del proyecto)
docker compose up -d

# 2. Ejecutar el microservicio
cd ms-pedidos
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
- Swagger UI: http://localhost:4002/swagger-ui.html
- Especificación JSON: http://localhost:4002/v3/api-docs

## API REST
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servicio |
| `POST` | `/pedidos` | Crear pedido → pedido creado (`PENDIENTE`) |
| `GET` | `/pedidos?userId={id}` | Listar pedidos (opcional por usuario) → `{ items: [...] }` |
| `GET` | `/pedidos/{id}` | Obtener pedido por id |
| `PUT` | `/pedidos/{id}` | Actualizar estado/plan |
| `DELETE` | `/pedidos/{id}` | Eliminar pedido → `{ ok: true }` |

### Ejemplo
```bash
curl -X POST http://localhost:4002/pedidos \
  -H "Content-Type: application/json" \
  -d '{"userId":"<uuid-de-usuario>","plan":2}'
```
