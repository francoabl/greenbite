# Microservicio Usuarios

Gestiona registro, login y CRUD de usuarios. Base de datos dedicada: usuarios_db.

## Requisitos
- Node.js 18+
- PostgreSQL

## Configuracion
Crear un archivo .env con:

```
PORT=4001
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/usuarios_db
JWT_SECRET=dev_secret
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
