# Análisis de Patrones y Arquetipos

## GreenBite — Evaluación Parcial N°3
### Desarrollo Fullstack III

> Documento actualizado tras migrar los microservicios **ms-usuarios** y
> **ms-pedidos** de Node.js/Express a **Java 17 + Spring Boot** con persistencia
> **JPA/Hibernate**. El frontend (React) y el BFF (Node/Express) se mantienen.

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
 │  Spring Boot    │             │  Spring Boot    │
 │  (Java 17, JPA) │             │  (Java 17, JPA) │
 │  :4001          │             │  :4002          │
 └────────┬────────┘             └────────┬────────┘
          │ JPA / Hibernate               │ JPA / Hibernate
          ▼                               ▼
 ┌─────────────────┐             ┌─────────────────┐
 │  usuarios_db    │             │  pedidos_db     │
 │  PostgreSQL     │             │  PostgreSQL     │
 │  :5433          │             │  :5434          │
 └─────────────────┘             └─────────────────┘
```

> **Diversidad tecnológica (intencional):** **React** (frontend) +
> **Node.js/Express** (BFF) + **Java/Spring Boot** (microservicios), integrados
> mediante API REST. Esto demuestra el uso de distintos lenguajes y tecnologías
> cumpliendo los requerimientos del cliente.

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
- `ms-usuarios/src/main/resources/application.properties` configura el datasource
  que apunta exclusivamente a `usuarios_db`.
- `ms-pedidos/src/main/resources/application.properties` apunta exclusivamente a
  `pedidos_db`. Cada servicio gestiona su esquema con Hibernate (`ddl-auto=update`).

---

### 3.3. Microservicios

**Descripción:**
La lógica de negocio se divide en dos microservicios independientes, ambos
construidos con **Java 17 + Spring Boot 3.5** (Spring Web + Spring Data JPA):
- `ms-usuarios`: Autenticación (registro/login con JWT + BCrypt) y CRUD de usuarios.
- `ms-pedidos`: CRUD de pedidos con lógica de precios de planes.

Ambos exponen su API documentada con **Swagger/OpenAPI** (springdoc) y se
comunican con el BFF exclusivamente mediante HTTP REST; no existe comunicación
directa entre ellos.

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
- `ms-usuarios/src/main/java/com/greenbite/usuarios/repository/UsuarioRepository.java`
- `ms-pedidos/src/main/java/com/greenbite/pedidos/repository/PedidoRepository.java`

**Descripción:**
El Repository Pattern separa el acceso a datos de la lógica de negocio. En la
versión Spring Boot se implementa con **Spring Data JPA**: cada repositorio es una
interfaz que extiende `JpaRepository`, y Spring genera la implementación en tiempo
de ejecución (incluidas las *query methods* derivadas del nombre del método).

**Problema que resuelve:**
- Sin este patrón, las consultas estarían dispersas en los servicios, mezclando
  lógica de negocio con detalles de persistencia. Esto dificulta el mantenimiento,
  las pruebas y el cambio de base de datos.

**Ventajas obtenidas:**
- No se escribe SQL manual: JPA/Hibernate genera las consultas; los métodos
  derivados (`findByEmail`, `findByUserIdOrderByCreatedAtDesc`) son declarativos.
- Las pruebas unitarias **mockean el repositorio** (con Mockito) para probar la
  lógica de negocio sin base de datos real.
- El mapeo objeto-relacional se centraliza en las entidades `@Entity`.

```java
// repository/PedidoRepository.java — interfaz; Spring genera la implementacion
@Repository
public interface PedidoRepository extends JpaRepository<Pedido, UUID> {
    List<Pedido> findAllByOrderByCreatedAtDesc();
    List<Pedido> findByUserIdOrderByCreatedAtDesc(UUID userId);
}

// service/PedidoService.java — solo logica de negocio, delega en el repositorio
public List<PedidoResponse> list(UUID userId) {
    List<Pedido> pedidos = (userId != null)
            ? repository.findByUserIdOrderByCreatedAtDesc(userId)
            : repository.findAllByOrderByCreatedAtDesc();
    return pedidos.stream().map(PedidoResponse::from).toList();
}
```

---

### 4.4. Singleton / Inversión de Control (Backend)

**Tipo:** Patrón de diseño creacional — Backend

**Ubicación:** contenedor de Spring (IoC) en ambos microservicios.

**Descripción:**
Spring Boot aplica el patrón Singleton de forma nativa a través de su contenedor de
**Inversión de Control (IoC)**: por defecto, cada bean (`@Service`, `@Repository`,
`@Component`, `@Configuration`) se crea **una sola vez** y se reutiliza mediante
**inyección de dependencias**. El pool de conexiones a la base de datos
(**HikariCP**, autoconfigurado por Spring) también es un único bean compartido.

**Problema que resuelve:**
- Crear una nueva conexión o una nueva instancia de servicio en cada operación
  sería ineficiente. Se necesita una única instancia compartida y reutilizable.

**Ventajas obtenidas:**
- Rendimiento: el pool HikariCP se crea una vez y reutiliza las conexiones.
- Consistencia: todos los componentes comparten las mismas instancias (servicios,
  repositorios, encoder, JwtService).
- Sin código *boilerplate*: el ciclo de vida lo gestiona el contenedor de Spring.

```java
// El servicio es un singleton gestionado por Spring; recibe sus dependencias
// (tambien singletons) por inyeccion de constructor.
@Service
public class UsuarioService {
    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UsuarioService(UsuarioRepository repository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
}
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
| **Repository** | Persistencia | Backend (ms) | Mezcla de lógica de negocio con acceso a datos (Spring Data JPA) |
| **Singleton / IoC** | Creacional | Backend (ms) | Instancias y conexiones a BD innecesarias (beans + HikariCP) |
| **Factory** | Creacional | Backend (BFF) | Duplicación en creación de clientes HTTP |

---

## 6. Arquetipos de Proyecto

El BFF sigue el arquetipo de Node.js/Express; los microservicios siguen el
arquetipo estándar de **Spring Boot (Maven)** en capas.

### Backend For Frontend (Node.js/Express)
```
bff/
  src/
    routes/        → Definición de endpoints
    controllers/   → Manejo de requests/responses
    services/      → Comunicación con microservicios
    middleware/    → Error handling, autenticación
    utils/         → Utilidades (mapeo de errores)
```

### Microservicio Usuarios (Java/Spring Boot)
```
ms-usuarios/
  pom.xml          → Dependencias Maven (Spring Web, Data JPA, JWT, Swagger)
  src/main/java/com/greenbite/usuarios/
    web/           → Controllers REST (@RestController)
    service/       → Lógica de negocio (registro, login)
    repository/    → Spring Data JPA (interfaces JpaRepository)
    entity/        → Entidades JPA (@Entity)
    dto/           → Objetos de request/response
    security/      → JwtService (generación de tokens)
    config/        → CORS, BCrypt, OpenAPI
    exception/     → ApiException + GlobalExceptionHandler
  src/main/resources/application.properties → Datasource + JPA
  src/test/java/...                          → Pruebas JUnit
```

### Microservicio Pedidos (Java/Spring Boot)
```
ms-pedidos/
  pom.xml          → Dependencias Maven (Spring Web, Data JPA, Swagger)
  src/main/java/com/greenbite/pedidos/
    web/           → Controllers REST (@RestController)
    service/       → Lógica de negocio (planes, totales)
    repository/    → Spring Data JPA (interfaces JpaRepository)
    entity/        → Entidades JPA (@Entity)
    dto/           → Objetos de request/response
    config/        → CORS, OpenAPI
    exception/     → ApiException + GlobalExceptionHandler
  src/main/resources/application.properties → Datasource + JPA
  src/test/java/...                          → Pruebas JUnit
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
| **Código modular** | Separación en capas (web/service/repository/entity en los ms; routes/controllers/services en el BFF) |
| **Variables claras** | Nombres descriptivos en inglés/español (`createPedido`, `findByEmail`) |
| **Manejo de errores** | BFF: middleware global. Microservicios: `@RestControllerAdvice` con códigos HTTP (400, 401, 404, 409) |
| **Pruebas unitarias** | JUnit 5 + Mockito en los microservicios (mocks de repositorios); cobertura con JaCoCo |
| **Documentación de API** | Swagger/OpenAPI (springdoc) en cada microservicio |
| **Variables de entorno** | Configuración por `.env` (BFF) y `application.properties` (microservicios) |
| **Persistencia de sesión** | AuthContext + localStorage para mantener sesión entre recargas |

---

## 8. Pruebas Unitarias

Los microservicios se prueban con **JUnit 5 + Mockito**. Los repositorios se
mockean para probar la lógica de negocio de forma aislada (sin base de datos). La
cobertura se mide con **JaCoCo** (`mvnw test` genera `target/site/jacoco/index.html`).

### Microservicio Usuarios (`UsuarioServiceTest`)
```java
@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {
    @Mock UsuarioRepository repository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @InjectMocks UsuarioService service;

    @Test
    void registerOk() { /* crea usuario, hashea password, devuelve token */ }

    @Test
    void loginWrongPassword() { /* credenciales invalidas -> 401 */ }
}
```

### Microservicio Pedidos (`PedidoServiceTest`)
```java
@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {
    @Mock PedidoRepository repository;
    @InjectMocks PedidoService service;

    @Test
    void createOk() { /* plan valido calcula total y queda PENDIENTE */ }

    @Test
    void createInvalidPlan() { /* plan inexistente -> 400 */ }
}
```

**Resultados:** 15 pruebas en ms-usuarios y 13 en ms-pedidos (28 en total), todas
en verde. Cobertura de instrucciones: **70%** (ms-usuarios) y **64%** (ms-pedidos),
superando el mínimo del 60% exigido. El detalle está en el *Informe de Pruebas
Unitarias* (`docs/informe-pruebas-unitarias.pdf`).

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
