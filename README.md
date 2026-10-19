# registree-backend

API REST desarrollada con **Node.js**, **TypeScript**, **Express** y **MongoDB** para la gestión de inventario y dashboard gerencial de la plataforma *Registree*.

---

## Requisitos previos

* Node.js v24 LTS
* Docker Desktop para levantar MongoDB 8 en contenedor

---

## Variables de entorno

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `PORT` | Puerto en el que se ejecuta la API | `3000` |
| `MONGO_URI` | Cadena de conexión a MongoDB | `mongodb://registree_admin:cambiar_contrasena@localhost:27017/registree?authSource=admin` |
| `JWT_SECRET` | Cadena secreta para tokens JWT | Cadena aleatoria (revisar nota) |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `1d` |
| `MONGO_ROOT_USER` | Usuario de la bd para la cadena de conexión| `registree_admin` |
| `MONGO_ROOT_PASSWORD` | Contraseña de la bd para la cadena de conexión | `cambiar_contrasena` |
| `CORS_ORIGIN` | URL del frontend autorizada para hacer peticiones a la API | `http://localhost:5173` |
| `BCRYPT_SALT_ROUNDS` | Número del hash de contraseñas con bcrypt | `10` |

> **Nota:** para generar un `JWT_SECRET` propio se puede ejecutar:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## INSTRUCCIONES LEVANTAMIENTO BACKEND Y BD

* Clonar el repo: 
```bash
git clone https://github.com/PiolaPiolaPiola/registree-backend.git
```
* Instalar dependencias con 
```bash
npm install
```

* Variables de entorno (revisar también archivo .env.example para copiar en .env):

```bash
cp .env.example .env
```

* Levantar bd con 
```bash
docker compose up -d
```
> **Nota:** Si se modifica la contraseña de la bd después de levantar el contenedor, este se debe desmontar y volver a subir. Usar los siguientes comandos:
> ```bash
> docker compose down -v #tumba la bd y borra los datos
> docker compose up -d #levanta la bd
> ```

* Crear los usuarios de prueba (ver [Credenciales de prueba](#credenciales-de-prueba)):
```bash
npm run seed
```

* Para ejecución con dev, build y start, usar:
```bash
npm run dev #modo desarrollo
npm run build #modo producción para compilar
npm start #modo producción para ejecutar
```
---

## Credenciales de prueba

El comando `npm run seed` crea un usuario para cada rol. Se puede ejecutar varias veces: si el usuario ya existe, no lo duplica.

| Rol | Email | Contraseña | Permisos |
|---|---|---|---|
| `ADMIN` | `admin@registree.com` | `Admin12345` | Consultar, crear, actualizar y eliminar productos; administrar usuarios |
| `USER` | `user@registree.com` | `User12345` | Solo consultar productos (listado y detalle) |

> Estas credenciales son solo para pruebas locales.

---

## Autenticación

La API usa tokens JWT por medio del header.

```
Authorization: Bearer <token>
```

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registra un usuario | Público |
| `POST` | `/api/auth/login` | Valida credenciales y devuelve el token | Público |
| `GET` | `/api/auth/me` | Devuelve el usuario autenticado | Requiere token |

Ejemplo de body para registro:
```json
{
  "name": "Ana Pérez",
  "email": "ana@correo.com",
  "password": "Password123"
}
```

Ejemplo de body para login:
```json
{
  "email": "admin@registree.com",
  "password": "Admin12345"
}
```

**Decisiones de seguridad:**
* Las contraseñas se guardan hasheadas con bcrypt y nunca se devuelven en las respuestas.
* El registro público siempre crea usuarios con rol `USER`; los `ADMIN` se crean con el seed.
* El login responde el mismo error si el email no existe o la contraseña es incorrecta, para no revelar inormación de más.
* Solo usuarios activos pueden ingresar.
* CORS solo acepta peticiones desde la URL configurada en `CORS_ORIGIN`.

| Código | Significado |
|---|---|
| `401` | No autenticado: falta el token, es inválido, expiró o las credenciales son incorrectas |
| `403` | Autenticado, pero sin permisos para la acción (o usuario inactivo en el login) |

---

## Convenciones de las API

* Todas las peticiones y respuestas usan **JSON**, incluidos los errores y las rutas inexistentes.
* Las rutas protegidas requieren el header `Authorization: Bearer <token>` (ver [Autenticación](#autenticación)).
* Los campos que el cliente no tiene permitido enviar (por ejemplo `_id`, `createdBy`, `creationAt`) se ignoran con ls lógica de Pick.
* Las fechas de las respuestas están en UTC. Los filtros por fecha se reciben como `YYYY-MM-DD` y se interpretan en **hora Colombia (UTC-5)**.

### Formato de los listados paginados

Los listados usan `offset` y `limit`. 

| Parámetro | Tipo | Por defecto | Reglas |
|---|---|---|---|
| `offset` | entero | `0` | Mayor o igual a 0 |
| `limit` | entero | `10` | Entre 1 y 100 |

```json
{
  "data": [],
  "total": 25,
  "offset": 0,
  "limit": 10
}
```

`total` es la cantidad de registros que cumplen los filtros (total_count)

### Formato de los errores

```json
{ "message": "Producto no encontrado" }
```

Los errores de validación incluyen además la lista de todos los campos con problemas:

```json
{
  "message": "Datos inválidos",
  "errors": ["El precio debe ser mayor a 0", "El stock no puede ser número decimal"]
}
```

| Código | Cuándo |
|---|---|
| `400` | Datos o parámetros inválidos, id con formato incorrecto o JSON mal formado |
| `401` | Falta el token, es inválido o expiró |
| `403` | El rol del usuario no tiene permiso para la acción |
| `404` | El recurso o la ruta no existe |
| `409` | Conflicto con un dato único (por ejemplo, email ya registrado) |
| `500` | Error interno |

---

## Productos

Base: `/api/products`.

### Endpoints

| Método | Endpoint | Descripción | Acceso | Respuesta exitosa |
|---|---|---|---|---|
| `GET` | `/api/products` | Lista productos activos con paginación, búsqueda y filtro por fechas | `ADMIN`, `USER` | `200` listado paginado |
| `GET` | `/api/products/:id` | Detalle de un producto | `ADMIN`, `USER` | `200` producto |
| `POST` | `/api/products` | Crea un producto | `ADMIN` | `201` producto creado |
| `PATCH` | `/api/products/:id` | Actualiza los campos del producto | `ADMIN` | `200` producto actualizado |
| `DELETE` | `/api/products/:id` | Elimina el producto (borrado lógico) | `ADMIN` | `200` mensaje y producto |

### Filtros del listado

Además de `offset` y `limit` (ver [Formato de los listados paginados](#formato-de-los-listados-paginados)):

| Parámetro | Tipo | Descripción |
|---|---|---|
| `search` | texto | Busca productos que el título **contenga** el texto, sin distinguir mayúsculas |
| `from` | `YYYY-MM-DD` | Productos creados desde ese día (incluido), en hora Colombia |
| `to` | `YYYY-MM-DD` | Productos creados hasta ese día (incluido), en hora Colombia |

Ejemplo:

```
GET /api/products?search=mesa&from=2026-01-01&to=2026-01-31&offset=0&limit=10
```

* El listado siempre devuelve solo productos activos, ordenados del más reciente al más antiguo.
* `from` no puede ser posterior a `to`.

### Ejemplo de producto (respuesta)

```json
{
  "_id": "6ad56226821742b5c7dda9ca",
  "title": "Válvula",
  "description": "Válvula de presión",
  "price": 450000.5,
  "category": "Piscinas",
  "images": ["https://ejemplo.com/valvula.png"],
  "stock": 12,
  "active": true,
  "createdBy": "6ad561fe89a9166ba824a426",
  "updatedBy": "6ad561fe89a9166ba824a426",
  "creationAt": "2026-10-19T15:30:00.000Z",
  "updatedAt": "2026-10-19T15:30:00.000Z"
}
```

### Crear un producto

`POST /api/products`

```json
{
  "title": "Válvula",
  "description": "Válvula de presión",
  "price": 450000.5,
  "category": "Piscinas",
  "stock": 12,
  "images": ["https://ejemplo.com/valvula.png"]
}
```

Campos permitidos: `title`, `description`, `price`, `category`, `stock` e `images`. El servidor registra `createdBy`, `updatedBy`, `active` y las fechas.

### Actualizar un producto

`PATCH /api/products/:id`: se envían solo los campos que cambian. Debe llegar al menos uno.

```json
{
  "price": 420000,
  "stock": 10
}
```

Campos permitidos: los mismos de la creación, más `active` (para restaurar un producto eliminado).

### Reglas de validación

| Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| `title` | texto | Sí | 3 a 150 caracteres. Solo letras (con tildes y ñ), números, espacios y los signos `. , ( ) / & % ' + -` |
| `description` | texto | Sí | Máximo 1000 caracteres |
| `price` | número | Sí | Mayor a 0 y máximo 1.000.000. Se redondea a 2 decimales |
| `category` | texto | Sí | Máximo 50 caracteres. Solo letras y espacios |
| `stock` | número entero | Sí | Entre 0 y 1.000.000 |
| `images` | lista de textos | No | Máximo 4 URLs, cada una debe empezar por `http://` o `https://` |
| `active` | booleano | No | Solo en la actualización |

### Eliminación

* El producto no se elimina, solo se inactiva

### Errores específicos

| Código | Cuándo |
|---|---|
| `400` | Campos inválidos, body sin campos permitidos en la actualización, id con formato incorrecto, filtros inválidos (`limit`, fechas, `from` posterior a `to`) |
| `403` | Un `USER` intenta crear, actualizar o eliminar |
| `404` | El producto no existe (o está eliminado y lo consulta un `USER`) |

---

## Stack tecnológico

* **Runtime:** Node.js LTS (v24.16.0)
* **Lenguaje:** TypeScript
* **Framework Web:** Express.js
* **Base de Datos:** MongoDB (con contenedor de docker, v8)
* **ODM:** Mongoose
* **Seguridad & Autenticación:** JWT (JSON Web Tokens), Bcrypt, CORS
* **Precisión decimal:** Decimal.js

## Arquitectura Modular por capas

```text
src/
├── config/       # Configuración de base de datos y entorno
├── models/       # Modelos y esquemas de Mongoose
├── controllers/  # Manejo de peticiones HTTP y respuestas
├── services/     # Lógica de negocio pura
├── middlewares/  # Autenticación, roles y manejo de errores
├── routes/       # Definición de endpoints REST
├── scripts/      # Scripts auxiliares
├── types/        # Tipos globales de TypeScript 
└── utils/        # Utilidades compartidas 
```