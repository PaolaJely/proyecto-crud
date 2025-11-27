# API REST CRUD - Proyecto Docker

Proyecto de API REST CRUD usando Docker, Node.js, PostgreSQL y Nginx como reverse proxy.

## Estructura del Proyecto

```
proyecto-crud/
├── api-service/
│   ├── server.js          # Servidor Express con rutas CRUD
│   ├── package.json       # Dependencias del proyecto
│   └── Dockerfile         # Imagen Docker del API
├── nginx/
│   ├── nginx.conf         # Configuración del reverse proxy
│   └── Dockerfile         # Imagen Docker de Nginx
├── docker-compose.yml     # Orquestación de servicios
└── README.md              # Este archivo
```

## Requisitos

- Docker
- Docker Compose

## Instalación y Ejecución

### 1. Construir e iniciar los servicios

```bash
docker-compose up --build
```

### 2. Verificar que los servicios estén corriendo

```bash
docker-compose ps
```

Deberías ver tres servicios:
- `postgres-db`
- `api-service`
- `nginx-gateway`

## Endpoints de la API

La API está disponible a través de Nginx en el puerto 80:

- **Base URL**: `http://localhost/api`

### Rutas disponibles:

- `GET /api/users` - Listar todos los usuarios
- `GET /api/users/:id` - Obtener un usuario por ID
- `POST /api/users` - Crear un nuevo usuario
- `PUT /api/users/:id` - Actualizar un usuario
- `DELETE /api/users/:id` - Eliminar un usuario

## Pruebas con cURL

### 1. Listar todos los usuarios (inicialmente vacío)

```bash
curl http://localhost/api/users
```

**Respuesta esperada:**
```json
[]
```

### 2. Crear un nuevo usuario

```bash
curl -X POST http://localhost/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "correo": "juan@example.com"
  }'
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "correo": "juan@example.com"
}
```

### 3. Crear otro usuario

```bash
curl -X POST http://localhost/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María García",
    "correo": "maria@example.com"
  }'
```

### 4. Listar todos los usuarios

```bash
curl http://localhost/api/users
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "juan@example.com"
  },
  {
    "id": 2,
    "nombre": "María García",
    "correo": "maria@example.com"
  }
]
```

### 5. Obtener un usuario por ID

```bash
curl http://localhost/api/users/1
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "correo": "juan@example.com"
}
```

### 6. Actualizar un usuario

```bash
curl -X PUT http://localhost/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos Pérez",
    "correo": "juan.carlos@example.com"
  }'
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "nombre": "Juan Carlos Pérez",
  "correo": "juan.carlos@example.com"
}
```

### 7. Eliminar un usuario

```bash
curl -X DELETE http://localhost/api/users/1
```

**Respuesta esperada:**
```json
{
  "success": true
}
```

### 8. Verificar que el usuario fue eliminado

```bash
curl http://localhost/api/users
```

**Respuesta esperada:**
```json
[
  {
    "id": 2,
    "nombre": "María García",
    "correo": "maria@example.com"
  }
]
```

## Estructura de la Base de Datos

La tabla `users` se crea automáticamente al iniciar el servicio con la siguiente estructura:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nombre TEXT,
  correo TEXT
);
```

## Acceso a PostgreSQL

### Conectarse a la base de datos desde el host

```bash
docker exec -it proyecto-crud-postgres-db-1 psql -U postgres -d crud_db
```

O si el contenedor tiene un nombre diferente:

```bash
docker exec -it $(docker-compose ps -q postgres-db) psql -U postgres -d crud_db
```

### Comandos SQL útiles

```sql
-- Ver todas las tablas
\dt

-- Ver estructura de la tabla users
\d users

-- Consultar todos los usuarios
SELECT * FROM users;

-- Contar usuarios
SELECT COUNT(*) FROM users;

-- Salir
\q
```

## Gestión de Contenedores

### Ver logs de todos los servicios

```bash
docker-compose logs
```

### Ver logs de un servicio específico

```bash
docker-compose logs api-service
docker-compose logs postgres-db
docker-compose logs nginx-gateway
```

### Ver logs en tiempo real

```bash
docker-compose logs -f
```

### Detener los servicios

```bash
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ elimina los datos)

```bash
docker-compose down -v
```

### Reiniciar los servicios

```bash
docker-compose restart
```

### Reconstruir las imágenes

```bash
docker-compose up --build
```

## Arquitectura

```
Cliente
  │
  │ HTTP (Puerto 80)
  ▼
Nginx (Reverse Proxy)
  │
  │ /api/* → proxy_pass
  ▼
API Service (Node.js + Express)
  │
  │ SQL Queries
  ▼
PostgreSQL Database
```

## Configuración

### Variables de Entorno

**API Service:**
- `DB_HOST`: Host de PostgreSQL (default: `postgres-db`)
- `PORT`: Puerto del servidor (default: `3000`)

**PostgreSQL:**
- `POSTGRES_DB`: Nombre de la base de datos (default: `crud_db`)
- Usuario por defecto: `postgres`
- Contraseña por defecto: `postgres`

## Troubleshooting

### Los servicios no inician

1. Verifica que los puertos 80 y 5432 no estén en uso:
   ```bash
   sudo lsof -i :80
   sudo lsof -i :5432
   ```

2. Revisa los logs:
   ```bash
   docker-compose logs
   ```

3. Reconstruye las imágenes:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

### Error de conexión a la base de datos

1. Verifica que PostgreSQL esté corriendo:
   ```bash
   docker-compose ps postgres-db
   ```

2. Espera unos segundos para que PostgreSQL se inicie completamente.

3. Revisa los logs del API Service:
   ```bash
   docker-compose logs api-service
   ```

### La tabla no se crea

La tabla `users` se crea automáticamente al iniciar el servicio API. Verifica los logs:

```bash
docker-compose logs api-service | grep "Tabla users"
```

Deberías ver: `Tabla users lista`

## Notas

- Los datos de PostgreSQL se almacenan en un volumen de Docker (se eliminan con `docker-compose down -v`)
- El API Service espera a que PostgreSQL esté disponible antes de crear la tabla
- Nginx redirige todas las peticiones `/api/*` al servicio API
- El servicio API está disponible directamente en `http://localhost:3000` (si se expone el puerto)

