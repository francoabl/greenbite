# Documentación de la API REST (Swagger / OpenAPI)

Cada microservicio expone su documentación interactiva con **Swagger UI** (springdoc-openapi).
La especificación se genera automáticamente a partir del código de los controladores.

## Acceso en vivo (con los servicios levantados)

| Microservicio | Swagger UI | Especificación JSON |
|---|---|---|
| MS Usuarios | http://localhost:4001/swagger-ui.html | http://localhost:4001/v3/api-docs |
| MS Pedidos | http://localhost:4002/swagger-ui.html | http://localhost:4002/v3/api-docs |

Desde Swagger UI puedes ver todos los endpoints, sus parámetros, esquemas de
request/response y **probarlos directamente** con el botón *Try it out*.

## Especificaciones versionadas (snapshot)

Para el entregable, las especificaciones OpenAPI también están guardadas aquí:

- [`openapi-ms-usuarios.json`](openapi-ms-usuarios.json)
- [`openapi-ms-pedidos.json`](openapi-ms-pedidos.json)

Puedes importarlas en cualquier visor OpenAPI (por ejemplo https://editor.swagger.io)
para inspeccionarlas sin necesidad de levantar los servicios.

## Ejemplos de peticiones y respuestas

### MS Usuarios — `POST /usuarios/register`
**Request**
```json
{ "nombre": "Ana", "email": "ana@greenbite.cl", "password": "secret123" }
```
**Response 201**
```json
{
  "user": { "id": "8b04ef63-...", "nombre": "Ana", "email": "ana@greenbite.cl", "createdAt": "2026-06-15T23:18:29Z" },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### MS Usuarios — `POST /usuarios/login`
**Request**
```json
{ "email": "ana@greenbite.cl", "password": "secret123" }
```
**Response 200** → mismo formato `{ user, token }`. Credenciales inválidas → **401**.

### MS Pedidos — `POST /pedidos`
**Request**
```json
{ "userId": "8b04ef63-...", "plan": 2 }
```
**Response 201**
```json
{ "id": "b44d8260-...", "userId": "8b04ef63-...", "plan": 2, "status": "PENDIENTE", "total": 32990, "createdAt": "2026-06-15T23:18:29Z" }
```
Plan inválido (distinto de 1, 2 o 4) → **400**.

### MS Pedidos — `GET /pedidos?userId={id}`
**Response 200**
```json
{ "items": [ { "id": "...", "userId": "...", "plan": 2, "status": "PENDIENTE", "total": 32990, "createdAt": "..." } ] }
```
