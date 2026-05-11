# Microservicio Pedidos

Gestiona CRUD de pedidos. Base de datos dedicada: pedidos_db.

## Requisitos
- Node.js 18+
- PostgreSQL

## Configuracion
Crear un archivo .env con:

```
PORT=4002
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/pedidos_db
```

## Instalacion
```
npm install
```

## Desarrollo
```
npm run dev
```

## Produccion
```
npm start
```

## Pruebas
```
npm test
```

## Base de datos
Ejecutar el script en src/database/schema.sql
