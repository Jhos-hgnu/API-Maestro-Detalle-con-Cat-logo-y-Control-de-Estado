# API Maestro-Detalle con Catalogo y Control de Estado

Aplicacion para registrar estudiantes y el estado de sus misiones, y para visualizar su progreso. El catalogo de misiones se consulta en una base de datos SQL Server externa y compartida.

## Tecnologias

- Backend: NestJS, TypeScript, Prisma ORM, class-validator, class-transformer y Swagger.
- Frontend: React, Vite y TypeScript.
- Base de datos: SQL Server.

## Arquitectura

`React -> API NestJS -> Prisma -> SQL Server`

El frontend consulta el backend mediante `VITE_API_URL`. El backend usa Prisma solo como cliente de las tablas existentes y habilita CORS para los origenes configurados en `FRONTEND_ORIGIN`.

## Estructura

```text
backend/     API NestJS, DTOs, Prisma y pruebas
frontend/    Tablero React
backend/api/ Funciones serverless para Vercel
```

## Requisitos

- Node.js 22 o superior.
- Acceso autorizado a la instancia SQL Server proporcionada por el curso.

## Instalacion y configuracion

En `backend`, cree `.env` a partir de `.env.example` y configure:

```env
DATABASE_URL="sqlserver://SERVER:1433;database=DATABASE;user=USER;password=PASSWORD;encrypt=true;trustServerCertificate=true"
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

En `frontend`, cree `.env` a partir de `.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

Instale y ejecute cada aplicacion en terminales separadas:

```bash
cd backend
npm ci
npm run start:dev
```

```bash
cd frontend
npm ci
npm run dev
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| POST | `/api/registro` | Inserta o actualiza un estudiante y sus estados de mision de forma atomica. |
| GET | `/api/misiones` | Consulta el catalogo de misiones en modo lectura. |
| GET | `/api/estudiantes` | Devuelve estudiantes, misiones y progreso calculado. |

Ejemplo para `POST /api/registro`:

```json
{
  "maestro": {
    "carnet": "1890-23-2862",
    "nombre": "Josue Fernando Hicho Garcia",
    "correo": "jhicho@miumg.edu.gt"
  },
  "detalle": [
    { "misionId": 1, "estado": true }
  ]
}
```

Si el carnet no existe, se inserta el estudiante. Si existe, se actualizan nombre, correo y los estados enviados. Cada detalle se crea o actualiza por la clave unica `Carnet + MisionID`.

## Swagger

Con el backend en ejecucion, la documentacion interactiva esta disponible en `http://localhost:3000/api/docs`.

## Produccion y despliegue

Compile las aplicaciones con:

```bash
cd backend && npm run build
cd frontend && npm run build
```

El despliegue en Vercel es el siguiente paso y aun no existe una URL publica validada. Cree dos proyectos Vercel desde el mismo repositorio:

- Frontend: establezca `frontend` como **Root Directory**. Vercel detecta Vite y publica `dist`; configure `VITE_API_URL` con la URL publica del backend antes del build.
- Backend: establezca `backend` como **Root Directory**. Las funciones en `backend/api` inicializan NestJS sin llamar a `listen`, conservando las rutas `/api`, Swagger, CORS y Prisma. Configure `DATABASE_URL` y `FRONTEND_ORIGIN` desde las variables de entorno del proyecto.

`DATABASE_URL`, `FRONTEND_ORIGIN` y `VITE_API_URL` deben definirse en Vercel y nunca versionarse. La generacion de Prisma se ejecuta mediante `postinstall`; no genera migraciones ni modifica el esquema SQL Server.

## Base de datos compartida

La base SQL Server es externa y compartida. Este proyecto no administra su esquema: no ejecute migraciones, `prisma db push`, seeders ni operaciones DDL. El catalogo `Misiones` se usa exclusivamente mediante consultas de lectura.
