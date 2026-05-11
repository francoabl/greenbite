# Análisis de Patrones y Arquetipos

## GreenBite — Evaluación Parcial N°2
### Desarrollo Fullstack III

---

## 1. Introducción

GreenBite es una plataforma digital de suscripción de alimentos orgánicos. El sistema
permite a los usuarios registrarse, iniciar sesión y contratar planes de suscripción de
cestas orgánicas (1, 2 o 4 personas). La plataforma está construida sobre una
arquitectura de microservicios con un Backend for Frontend (BFF) como único punto
de entrada para el frontend React.

Este documento analiza los patrones de diseño y arquetipos arquitectónicos
implementados, justificando su selección según los problemas que resuelven y las
ventajas que aportan en términos de mantenibilidad, escalabilidad y desacoplamiento.

---

## 2. Arquitectura General del Sistema

```
                    ┌─────────────┐
                    │  Frontend   │
                    │  React+Vite │
                    │  :5173      │
                    └──────┬──────┘
                           │ HTTP REST (Axios)
                           ▼
                    ┌─────────────┐
                    │     BFF     │
                    │  Express.js │
                    │  :4000      │
                    └──┬──────┬───┘
                       │      │
              HTTP     │      │  HTTP
          ┌────────────┘      └────────────┐
          ▼                                 ▼
 ┌─────────────────┐             ┌─────────────────┐
 │  ms-usuarios    │             │  ms-pedidos     │
 │  Express.js     │             │  Express.js     │
 │  :4001          │             │  :4002          │
 └────────┬────────┘             └────────┬────────┘
          │                               │
          ▼                               ▼
 ┌─────────────────┐             ┌─────────────────┐
 │  usuarios_db    │             │  pedidos_db     │
 │  PostgreSQL     │             │  PostgreSQL     │
 │  :5433          │             │  :5434          │
 └─────────────────┘             └─────────────────┘
```

---

## 3. Patrones Arquitectónicos

### 3.1. Backend for Frontend (BFF)

**Descripción:**
El BFF actúa como un único punto de entrada para el frontend, ocultando la
complejidad de los microservicios internos. Toda la comunicación desde el frontend
pasa exclusivamente a través del BFF, nunca directamente a los microservicios.

**Problema que resuelve:**
- El frontend necesitaba consumir múltiples servicios (usuarios y pedidos), lo que
  implicaba gestionar varias URLs, tokens y lógicas de error distintas.
- Los microservicios internos exponen endpoints que no son óptimos para el
  frontend (ej. nombres de campos, estructura de respuestas).
- Sin un BFF, cualquier cambio en los microservicios obligaría a modificar el
  frontend, creando un acoplamiento fuerte.

**Ventajas obtenidas:**
- El frontend solo conoce una URL base (localhost:4000), simplificando la
  configuración.
- Los errores de los microservicios se normalizan en un solo formato antes de
  llegar al frontend (middleware `errorHandler.js` + `mapServiceError.js`).
- Los microservicios pueden evolucionar independientemente sin afectar al
  frontend.

**Implementación:**
- `bff/src/app.js` — Configura Express con rutas `/api/usuarios` y `/api/pedidos`.
- Cada ruta del BFF delega en un service que usa Axios para comunicarse con el
  microservicio correspondiente.

```javascript
// bff/src/services/pedidos.service.js
async function list(userId) {
  const response = await clients.pedidos.get("/pedidos", {
    params: { userId }
  });
  return response.data;
}
```

---

### 3.2. Database per Service

**Descripción:**
Cada microservicio posee su propia base de datos PostgreSQL independiente.
`ms-usuarios` solo accede a `usuarios_db` y `ms-pedidos` solo a `pedidos_db`.
Ningún servicio accede a la base de datos de otro.

**Problema que resuelve:**
- Una base de datos compartida crea acoplamiento: un cambio en el esquema de
  usuarios puede afectar al módulo de pedidos y viceversa.
- Los microservicios perderían su autonomía si compartieran datos, ya que una
  caída de la BD compartida afectaría a todos los servicios.

**Ventajas obtenidas:**
- Cada equipo puede evolucionar su esquema de datos sin coordinación con otros
  equipos.
- Aislamiento de fallas: si `pedidos_db` falla, `ms-usuarios` sigue funcionando.
- Cada base de datos puede escalarse de forma independiente según su carga.

**Implementación:**
- `docker-compose.yml` define dos contenedores PostgreSQL: `usuarios_db`
  (puerto 5433) y `pedidos_db` (puerto 5434), cada uno con volumen persistente
  propio.
- `ms-usuarios/src/database/db.js` se conecta exclusivamente a `usuarios_db`.
- `ms-pedidos/src/database/db.js` se conecta exclusivamente a `pedidos_db`.

---

### 3.3. Microservicios

**Descripción:**
La lógica de negocio se divide en dos microservicios independientes:
- `ms-usuarios`: Autenticación (registro/login con JWT + bcrypt) y CRUD de usuarios.
- `ms-pedidos`: CRUD de pedidos con lógica de precios de planes.

Ambos se comunican exclusivamente mediante APIs HTTP REST y no existe
comunicación directa entre ellos.

**Problema que resuelve:**
- Un monolito centraliza toda la lógica, dificultando el escalado y el mantenimiento.
- Los cambios en una funcionalidad (ej. lógica de pedidos) pueden afectar a otras
  (ej. autenticación) por el acoplamiento.

**Ventajas obtenidas:**
- Escalabilidad independiente: se puede escalar `ms-pedidos` sin afectar
  `ms-usuarios`.
- Despliegue independiente: cada servicio se puede actualizar sin detener los
  demás.
- Aislamiento de fallas: un error en pedidos no afecta la autenticación de usuarios.

---

## 4. Patrones de Diseño Implementados

### 4.1. Provider Pattern (Frontend)

**Tipo:** Patrón de diseño estructural — Frontend

**Ubicación:** `frontend/src/contexts/AuthContext.jsx`

**Descripción:**
El Provider Pattern permite compartir estado global entre múltiples componentes
sin pasarlo explícitamente por props. En GreenBite, `AuthProvider` envuelve toda
la aplicación y provee el estado de autenticación (usuario, token) y las funciones
para iniciar/cerrar sesión a cualquier componente hijo.

**Problema que resuelve:**
- El estado de autenticación (usuario logueado, token JWT) es necesario en varios
  componentes: BrandHeader (para mostrar el nombre), Login (para autenticar),
  Pedidos (para crear pedidos). Sin un provider, habría que pasar `user` y
  `token` por props a través de toda la jerarquía de componentes (prop drilling).

**Ventajas obtenidas:**
- Elimina el prop drilling: cualquier componente consume el contexto mediante
  `useAuth()` sin importar su profundidad en el árbol.
- Centraliza la lógica de autenticación: login, register y logout se gestionan en
  un solo lugar, reduciendo duplicación.
- Persistencia automática: el estado se sincroniza con localStorage para
  mantener la sesión entre recargas de página.

```javascript
// Ejemplo de uso en cualquier componente
import useAuth from "../hooks/useAuth.js";

function BrandHeader() {
  const { user, logout } = useAuth();
  // user.nombre disponible sin props
}
```

---

### 4.2. Custom Hooks Pattern (Frontend)

**Tipo:** Patrón de diseño de comportamiento — Frontend

**Ubicación:**
- `frontend/src/hooks/useAuth.js`
- `frontend/src/hooks/usePedidos.js`

**Descripción:**
Los Custom Hooks encapsulan lógica de estado y efectos secundarios en funciones
reutilizables. En lugar de repetir la lógica de llamadas API, manejo de loading y
error en cada componente, se extrae a hooks personalizados.

**Problema que resuelve:**
- La lógica de autenticación (consumir contexto) y la de pedidos (llamadas API,
  estados loading/error, recarga de datos) se repetiría en cada componente que
  la necesite.

**Ventajas obtenidas:**
- Reutilización: `usePedidos()` se usa en `Pedidos.jsx` y podría usarse en
  cualquier otro componente futuro que necesite listar pedidos.
- Separación de responsabilidades: los componentes se enfocan en la UI,
  mientras los hooks manejan la lógica de estado y efectos.
- Testeabilidad: la lógica encapsulada en hooks es más fácil de probar de forma
  aislada.

```javascript
// hooks/usePedidos.js — lógica encapsulada
export default function usePedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/pedidos");
      setPedidos(response.data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPedidos(); }, [loadPedidos]);
  return { pedidos, loading, error, loadPedidos, createPedido };
}
```

---

### 4.3. Repository Pattern (Backend)

**Tipo:** Patrón de diseño de persistencia — Backend

**Ubicación:**
- `ms-usuarios/src/repositories/usuarios.repository.js`
- `ms-pedidos/src/repositories/pedidos.repository.js`

**Descripción:**
El Repository Pattern separa la lógica de acceso a datos (SQL) de la lógica de
negocio (services). Los repositorios son los únicos responsables de interactuar
con la base de datos, mientras que los servicios se enfocan en las reglas de
negocio.

**Problema que resuelve:**
- Sin este patrón, las consultas SQL estarían dispersas en los servicios,
  mezclando lógica de negocio con detalles de persistencia. Esto dificulta el
  mantenimiento, las pruebas y el cambio de base de datos.

**Ventajas obtenidas:**
- Cambiar de PostgreSQL a otra base de datos solo requiere modificar los
  repositorios, no los servicios.
- Las pruebas unitarias pueden mockear el repositorio para probar la lógica de
  negocio sin base de datos real.
- Centraliza las consultas SQL, facilitando la optimización y la detección de
  errores.

```javascript
// repositories/pedidos.repository.js — solo acceso a datos
async function listPedidos(userId) {
  const pool = getPool();
  let query = "SELECT * FROM pedidos";
  const params = [];
  if (userId) { query += " WHERE user_id = $1"; params.push(userId); }
  query += " ORDER BY created_at DESC";
  const result = await pool.query(query, params);
  return result.rows.map(mapPedido);
}

// services/pedidos.service.js — solo lógica de negocio
async function listPedidos(userId) {
  const pedidos = await repository.listPedidos(userId);  // delega en repo
  return { items: pedidos };
}
```

---

### 4.4. Singleton Pattern (Backend)

**Tipo:** Patrón de diseño creacional — Backend

**Ubicación:**
- `ms-usuarios/src/database/db.js`
- `ms-pedidos/src/database/db.js`

**Descripción:**
El Singleton Pattern asegura que exista una única instancia del pool de conexiones
a la base de datos, reutilizada en toda la aplicación. Se implementa mediante un
módulo que cachea el pool en una variable de módulo.

**Problema que resuelve:**
- Crear una nueva conexión a la base de datos en cada operación sería ineficiente
  y consumiría recursos innecesarios. Sin un singleton, cada consulta SQL crearía
  una nueva conexión.

**Ventajas obtenidas:**
- Rendimiento: el pool de conexiones se crea una sola vez y se reutiliza,
  reduciendo la sobrecarga de conexiones.
- Consistencia: todos los módulos comparten la misma configuración de conexión.
- Control centralizado: la lógica de conexión (timeout, pool size, etc.) se define
  en un solo lugar.

```javascript
// database/db.js — implementación Singleton
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

module.exports = { getPool };
```

---

### 4.5. Factory Pattern (Backend - BFF)

**Tipo:** Patrón de diseño creacional — Backend

**Ubicación:** `bff/src/services/clientFactory.js`

**Descripción:**
El Factory Pattern centraliza la creación de clientes HTTP (Axios) para cada
microservicio. En lugar de crear manualmente cada cliente con su configuración,
se utiliza una fábrica que los genera con valores predefinidos.

**Problema que resuelve:**
- Sin una fábrica, cada servicio del BFF tendría que crear su propio cliente Axios
  con la URL base, timeout y headers, duplicando configuración.

**Ventajas obtenidas:**
- Consistencia: todos los clientes HTTP comparten la misma configuración base
  (timeout de 8s, Content-Type JSON).
- Mantenibilidad: cambiar la configuración global (ej. timeout) se hace en un
  solo lugar.
- Escalabilidad: agregar un nuevo microservicio solo requiere añadir una línea
  en la fábrica.

```javascript
// clientFactory.js — implementación Factory
function createClient(baseURL) {
  return axios.create({
    baseURL,
    timeout: 8000,
    headers: { "Content-Type": "application/json" }
  });
}

function createClients() {
  return {
    usuarios: createClient(process.env.USUARIOS_SERVICE_URL),
    pedidos: createClient(process.env.PEDIDOS_SERVICE_URL)
  };
}
```

---

## 5. Resumen de Patrones Implementados

| Patrón | Tipo | Capa | Problema que Resuelve |
|--------|------|------|----------------------|
| **Provider** | Estructural | Frontend | Prop drilling del estado de autenticación |
| **Custom Hooks** | Comportamiento | Frontend | Duplicación de lógica de estado/efectos |
| **Repository** | Persistencia | Backend (ms) | Mezcla de lógica de negocio con SQL |
| **Singleton** | Creacional | Backend (ms) | Múltiples conexiones a BD innecesarias |
| **Factory** | Creacional | Backend (BFF) | Duplicación en creación de clientes HTTP |

---

## 6. Arquetipos de Proyecto

Cada componente del backend sigue un arquetipo de Node.js/Express con estructura
modular estandarizada:

### Backend For Frontend
```
bff/
  src/
    routes/        → Definición de endpoints
    controllers/   → Manejo de requests/responses
    services/      → Comunicación con microservicios
    middleware/    → Error handling, autenticación
    utils/         → Utilidades (mapeo de errores)
```

### Microservicio Usuarios
```
ms-usuarios/
  src/
    routes/        → Definición de endpoints REST
    controllers/   → Manejo de HTTP requests
    services/      → Lógica de negocio (registro, login)
    repositories/  → Acceso a base de datos
    models/        → Mapeo de datos
    database/      → Conexión y schema SQL
    middleware/    → Error handling
    utils/         → Clases de error HTTP
```

### Microservicio Pedidos
```
ms-pedidos/
  src/
    routes/        → Definición de endpoints REST
    controllers/   → Manejo de HTTP requests
    services/      → Lógica de negocio (planes, totales)
    repositories/  → Acceso a base de datos
    models/        → Mapeo de datos
    database/      → Conexión y schema SQL
    middleware/    → Error handling
    utils/         → Clases de error HTTP
```

Este arquetipo asegura:
- **Separación de responsabilidades**: cada capa tiene un rol definido.
- **Escalabilidad**: nuevos microservicios siguen la misma estructura.
- **Mantenibilidad**: un desarrollador que conoce un microservicio puede
  trabajar en cualquier otro sin curva de aprendizaje.

---

## 7. Buenas Prácticas Implementadas

| Práctica | Implementación |
|----------|---------------|
| **Código modular** | Cada funcionalidad en su propio archivo (routes/controllers/services/repositories) |
| **Variables claras** | Nombres descriptivos en inglés/español (`createPedido`, `findByEmail`) |
| **Manejo de errores** | Middleware global de errores con clases HTTP personalizadas (400, 401, 404, 409) |
| **Pruebas unitarias** | Jest con mocks de repositorios para tests de servicios |
| **Variables de entorno** | Configuración por `.env` (puertos, URLs, JWT secret) |
| **Persistencia de sesión** | AuthContext + localStorage para mantener sesión entre recargas |

---

## 8. Pruebas Unitarias

### Microservicio Usuarios
```javascript
// tests/usuarios.service.test.js
describe("usuarios.service", () => {
  it("registerUser crea usuario y token", async () => { ... });
  it("loginUser rechaza credenciales invalidas", async () => { ... });
});
```

### Microservicio Pedidos
```javascript
// tests/pedidos.service.test.js
describe("pedidos.service", () => {
  it("createPedido calcula total", async () => { ... });
});
```

Ambos tests utilizan Jest con mocking de los repositorios, lo que permite probar
la lógica de negocio sin necesidad de una base de datos real.

---

## 9. Conclusiones

La combinación de patrones de diseño y arquitectónicos en GreenBite demuestra:

1. **Desacoplamiento total**: Cada capa y cada servicio es independiente,
   comunicándose solo mediante interfaces bien definidas (HTTP REST, contextos).

2. **Escalabilidad**: Los microservicios pueden escalarse y desplegarse de forma
   independiente. El patrón Database per Service garantiza que no existan cuellos
   de botella compartidos.

3. **Mantenibilidad**: El código está organizado por responsabilidades siguiendo
   arquetipos consistentes. Los patrones Repository y Singleton centralizan
   operaciones críticas, facilitando cambios futuros.

4. **Experiencia de desarrollo**: Los patrones Provider y Custom Hooks eliminan
   complejidades del frontend, mientras que Factory simplifica la comunicación
   entre BFF y microservicios.
