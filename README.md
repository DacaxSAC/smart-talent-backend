# Smart Talent API

API RESTful para gestión de usuarios, roles y permisos desarrollada con Node.js, Express y PostgreSQL.

## Cambios Realizados

Se ha migrado la base de datos de MongoDB a PostgreSQL utilizando Sequelize como ORM.

## Características

- Arquitectura MVC (Modelo-Vista-Controlador)
- Autenticación mediante JWT (JSON Web Tokens)
- Gestión de usuarios con roles y permisos
- Validación de datos de entrada
- Middleware de autenticación y autorización
- Estructura de proyecto escalable

## Requisitos previos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)

## Instalación

1. Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd 002-smart-talent-api
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
PORT=5000
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=smart_talent_db
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_contraseña
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRE=24h
NODE_ENV=development
```

4. Inicializar la base de datos con roles predeterminados:

```bash
npm run init-db
```

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

## Estructura del proyecto

```
002-smart-talent-api/
├── src/
│   ├── config/           # Configuraciones y utilidades
│   ├── controllers/      # Controladores de la aplicación
│   ├── middleware/       # Middleware personalizado
│   ├── models/           # Modelos de datos (Mongoose)
│   ├── routes/           # Definición de rutas
│   └── server.js         # Punto de entrada de la aplicación
├── .env                  # Variables de entorno
├── package.json          # Dependencias y scripts
└── README.md            # Documentación
```

## API Endpoints

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil del usuario actual

### Usuarios

- `POST /api/users` - Crear usuario (Admin)
- `GET /api/users` - Obtener todos los usuarios (Admin, Manager)
- `GET /api/users/:id` - Obtener usuario por ID (Admin, Manager)
- `PUT /api/users/:id` - Actualizar usuario (Admin)
- `DELETE /api/users/:id` - Eliminar usuario (Admin)

### Roles

- `POST /api/roles` - Crear rol (Admin)
- `GET /api/roles` - Obtener todos los roles (Admin, Manager)
- `GET /api/roles/:id` - Obtener rol por ID (Admin, Manager)
- `PUT /api/roles/:id` - Actualizar rol (Admin)
- `DELETE /api/roles/:id` - Eliminar rol (Admin)

## Roles predeterminados

- **ADMIN**: Acceso completo al sistema (CREATE, READ, UPDATE, DELETE)
- **MANAGER**: Acceso a gestión y reportes (CREATE, READ, UPDATE)
- **USER**: Usuario estándar (READ)
- **GUEST**: Usuario invitado con acceso limitado (READ)

## Licencia

ISC