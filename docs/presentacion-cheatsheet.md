# Presentación GreenBite — Cheatsheet

## Orden de inicio (mañana)

```bash
# 1. Docker (bases de datos)
docker compose up -d

# 2. Esperar 10s y crear tablas
docker compose exec usuarios_db psql -U postgres -d usuarios_db -f src/database/schema.sql
docker compose exec pedidos_db psql -U postgres -d pedidos_db -f src/database/schema.sql

# 3. Terminales separadas:
cd ms-usuarios   && npm run dev   # puerto 4001
cd ms-pedidos    && npm run dev   # puerto 4002
cd bff           && npm run dev   # puerto 4000
cd frontend      && npm run dev   # puerto 5173

# Alternativa: doble clic en iniciar.bat y hace todo automatico
```

---

## URLs

| Servicio | URL | Puerto |
|----------|-----|--------|
| Frontend | http://localhost:5173 | 5173 |
| BFF | http://localhost:4000 | 4000 |
| ms-usuarios | http://localhost:4001 | 4001 |
| ms-pedidos | http://localhost:4002 | 4002 |

---

## Qué decir en la defensa

### Arquitectura (¿por qué?)
- **Microservicios**: escalabilidad, despliegue independiente, aislamiento de fallas
- **BFF**: frontend solo conoce 1 URL, oculta complejidad, normaliza errores
- **Database per Service**: cada servicio tiene su propia BD, evita acoplamiento

### Patrones de diseño (5 implementados)
| Patrón | Dónde | ¿Qué problema resuelve? |
|--------|-------|------------------------|
| **Provider** | AuthContext.jsx | Prop drilling del estado de auth |
| **Custom Hooks** | useAuth, usePedidos | Lógica duplicada de estado/API |
| **Repository** | repositories/ | SQL mezclado con lógica de negocio |
| **Singleton** | database/db.js | Múltiples conexiones a BD |
| **Factory** | clientFactory.js | Creación repetitiva de clientes HTTP |

### Git (branching)
- **main**: código estable
- **develop**: integración de features
- **feature/***: desarrollo individual
- Commits con formato `tipo: descripción`

### Pruebas
- Jest con mocks de repositorios
- `cd ms-usuarios && npm test`
- `cd ms-pedidos && npm test`

### Para detener todo
```bash
docker compose down          # apaga bases de datos
# Cerrar las terminales de los servicios manualmente
```
