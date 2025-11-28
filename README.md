# 🚀 API REST CRUD - Microservicios con Docker

Sistema de gestión de usuarios con arquitectura de microservicios usando Node.js, PostgreSQL y Nginx.

---

## 📋 Descripción

API REST que implementa operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para usuarios. El proyecto utiliza una arquitectura de tres capas:

- **Nginx**: Gateway y reverse proxy
- **API Service**: Backend con lógica de negocio
- **PostgreSQL**: Base de datos

---

## 🛠️ Tecnologías

- **Node.js** 18
- **Express** 4.18.2
- **PostgreSQL** 15
- **Nginx** (alpine)
- **Docker** & Docker Compose

---

## 📁 Estructura del Proyecto

```
proyecto-crud/
│
├── api-service/
│   ├── server.js          # Código del API
│   ├── package.json       # Dependencias
│   └── Dockerfile
│
├── nginx/
│   ├── nginx.conf         # Configuración proxy
│   └── Dockerfile
│
└── docker-compose.yml     # Orquestación
```

---

## 🌐 Servicios y Puertos

### Desarrollo Local

| Servicio | Puerto | URL |
|----------|--------|-----|
| **nginx-gateway** | 80 | http://localhost |
| **api-service** | 3000 | http://localhost:3000 |
| **postgres-db** | 5432 | localhost:5432 |

### Producción (Render)

| Servicio | URL |
|----------|-----|
| **nginx-gateway** | https://nginx-gateway-crud.onrender.com |
| **api-service** | https://proyecto-crud-1nku.onrender.com |

---

## 📡 Endpoints

**Base URL:** https://nginx-gateway-crud.onrender.com/api

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/users` | Listar usuarios |
| `GET` | `/users/:id` | Obtener usuario |
| `POST` | `/users` | Crear usuario |
| `PUT` | `/users/:id` | Actualizar usuario |
| `DELETE` | `/users/:id` | Eliminar usuario |

---

## 🧪 Ejemplos de Uso

### Listar usuarios
```bash
curl https://nginx-gateway-crud.onrender.com/api/users
```

### Crear usuario
```bash
curl -X POST https://nginx-gateway-crud.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"nombre":"María","correo":"maria@example.com"}'
```

### Actualizar usuario
```bash
curl -X PUT https://nginx-gateway-crud.onrender.com/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"nombre":"María Actualizada","correo":"nueva@example.com"}'
```

### Eliminar usuario
```bash
curl -X DELETE https://nginx-gateway-crud.onrender.com/api/users/1
```

---

## 🏗️ Arquitectura

### Local (Docker Compose)
```
Usuario → nginx:80 → api-service:3000 → postgres:5432
```

### Producción (Render)
```
Usuario → nginx-gateway → api-service → PostgreSQL Database
```

---

## 🚀 Ejecución Local

```bash
docker-compose up --build
```

Acceder a: http://localhost/api/users

---

## 📊 Base de Datos

**Tabla:** `users`

| Campo | Tipo |
|-------|------|
| id | SERIAL PRIMARY KEY |
| nombre | TEXT |
| correo | TEXT |
