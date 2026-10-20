# registree-backend

API REST desarrollada con **Node.js**, **TypeScript**, **Express** y **MongoDB** para la gestión de inventario y dashboard gerencial de la plataforma *Registree*.

* La API queda disponible en `http://localhost:3000/api`. Para verificar que está funcionando y conectada a la bd:
  `GET http://localhost:3000/api/health` → `{ "status": "Ok", "database_connected": true }`
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

* Levantar bd (con Docker Desktop abierto):
```bash
docker compose up -d
```
> **Nota:** Si se modifica la contraseña de la bd después de levantar el contenedor, este se debe desmontar y volver a subir. Usar los siguientes comandos:
> ```bash
> docker compose down -v #tumba la bd y borra los datos
> docker compose up -d #levanta la bd
> ```

* Crear los usuarios y productos de prueba (ver [Credenciales de prueba](#credenciales-de-prueba)):
```bash
npm run seed
```

> **Nota:** El mensaje final ‘La bd se encuentra desconectada’ es normal: el script cierra la conexión al terminar el run seed

* Para ejecución con dev, build o start, usar uno de estos comandos:
```bash
npm run dev #modo desarrollo
npm run build #modo producción para compilar
npm start #modo producción para ejecutar
```
---

## Credenciales de prueba

El comando `npm run seed` crea un usuario para cada rol y 12 productos de prueba (con fechas de creación repartidas en los últimos 28 días, productos agotados, con poco stock, sin imagen, con varias imágenes y con una URL de imagen que no carga, para ver la imagen por defecto). Se puede ejecutar varias veces: si el usuario o el producto ya existe, no lo duplica. Si un producto de prueba se eliminó desde la app, el seed sí lo vuelve a crear.

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
| `GET` | `/api/auth/me` | Devuelve el usuario autenticado y su información | Requiere token |

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
* El registro público siempre crea usuarios con rol `USER`; los `ADMIN` se crean con el seed o desde usuarios, pero con el permiso.
* El login responde el mismo error si el email no existe o la contraseña es incorrecta, para no revelar información de más.
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
* Los campos que el cliente no tiene permitido enviar (por ejemplo `_id`, `createdBy`, `creationAt`) se ignoran con la lógica de pick.
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

## Usuarios

Base: `/api/users`. Todas las rutas son solo para `ADMIN`.

### Endpoints

| Método | Endpoint | Descripción | Acceso | Respuesta exitosa |
|---|---|---|---|---|
| `GET` | `/api/users` | Lista usuarios con paginación y filtro por estado | `ADMIN` | `200` listado paginado |
| `GET` | `/api/users/:id` | Detalle de un usuario | `ADMIN` | `200` usuario |
| `POST` | `/api/users` | Crea un usuario con el rol indicado | `ADMIN` | `201` usuario creado |
| `PATCH` | `/api/users/:id` | Actualiza los campos del usuario | `ADMIN` | `200` usuario actualizado |
| `PATCH` | `/api/users/:id/status` | Inactiva o reactiva un usuario | `ADMIN` | `200` usuario actualizado |

### Filtros del listado

| Parámetro | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `active` | `true` o `false` | `true` | Filtra los usuarios por estado |

Ejemplo:

```
GET /api/users?active=false&offset=0&limit=10
```

* Por defecto solo se listan los usuarios activos. Con `active=false` se consultan los inactivos.
* Los usuarios se ordenan del más reciente al más antiguo.

### Ejemplo de usuario (respuesta)

```json
{
  "_id": "6ad561fe89a9166ba824a427",
  "name": "Stiven",
  "email": "stiven@correo.com",
  "role": "USER",
  "active": true,
  "creationAt": "2026-10-19T15:30:00.000Z",
  "updatedAt": "2026-10-19T15:30:00.000Z"
}
```

La contraseña nunca se incluye en las respuestas.

### Crear un usuario

`POST /api/users`

```json
{
  "name": "Aleja",
  "email": "aleja@correo.com",
  "password": "Password123",
  "role": "ADMIN"
}
```

Campos permitidos: `name`, `email`, `password` y `role`. Si no se envía `role`, se asigna `USER`. A diferencia del registro público (Auth), aquí un `ADMIN` sí puede crear otros administradores.

### Actualizar un usuario

`PATCH /api/users/:id`: se envían solo los campos que cambian. Debe llegar al menos uno.

```json
{
  "name": "Aleja",
  "role": "USER"
}
```

Campos permitidos: `name`, `email`, `password`, `role` y `active`.

* Si se cambia la contraseña, se guarda hasheada.
* Si se cambia el email, no puede pertenecer a otro usuario.

### Reglas de validación

| Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| `name` | texto | Sí | Máximo 100 caracteres. Solo letras (con tildes y ñ) y espacios |
| `email` | texto | Sí | Formato de correo válido, máximo 254 caracteres. Único. Se guarda en minúsculas |
| `password` | texto | Sí | Mínimo 8 caracteres |
| `role` | texto | No | `ADMIN` o `USER`. Por defecto `USER` |
| `active` | booleano | No | Solo en la actualización |

### Inactivación

* El usuario no se elimina, solo se inactiva.

`PATCH /api/users/:id/status`

```json
{ "active": false }
```

* Un usuario inactivo no puede iniciar sesión, y su token deja de funcionar de inmediato.
* Para reactivarlo se envía `{ "active": true }`.
* Un `ADMIN` no puede inactivarse ni cambiar su propio rol, para no quedarse sin acceso.

### Errores específicos

| Código | Cuándo |
|---|---|
| `400` | Campos inválidos, body sin campos permitidos en la actualización, id con formato incorrecto, `active` inválido, o un `ADMIN` intenta inactivarse o cambiar su propio rol |
| `403` | Un `USER` intenta acceder a cualquier ruta de usuarios |
| `404` | El usuario no existe |
| `409` | El email ya está registrado por otro usuario |

---

## Pruebas con Postman

La carpeta `postman/` contiene la colección y el entorno para probar la API.

1. En Postman, clic en **Import** y seleccionar los dos archivos de la carpeta `postman/`.
2. Seleccionar el entorno **Registree Local** (arriba a la derecha). Si se cambió el PORT en el .env, actualizar baseUrl en el entorno.
3. Con la API corriendo (`npm run dev`) y los usuarios de prueba creados (`npm run seed`), ejecutar **Auth → Login ADMIN**. El token se guarda automáticamente en el entorno.
4. Ejecutar el resto de los requests, o toda la colección con el **Collection Runner**.

| Variable | Descripción |
|---|---|
| `baseUrl` | URL base de la API (`http://localhost:3000/api`) |
| `token` | Token del `ADMIN`. Se llena con **Login ADMIN** |
| `userToken` | Token del `USER`. Se llena con **Login USER** (se usa en las pruebas de permisos) |
| `adminId` | Id del `ADMIN`. Se llena con **Login ADMIN** |
| `productId` | Se llena al crear un producto |
| `userId` | Se llena al crear un usuario |

La colección está organizada en carpetas **Auth**, **Productos** y **Usuarios**, cada una con una subcarpeta **Errores** para los casos de validación y permisos (`400`, `401`, `403`, `404`, `409`).

Cada request incluye pruebas sobre el código de estado y la estructura de la respuesta. Los emails de los usuarios de ejemplo usan `{{$timestamp}}`, por lo que la colección se puede ejecutar varias veces sin conflictos.


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

## Decisiones de arquitectura (ADR)

### ADR 01: Arquitectura por capas modular

| | |
|---|---|
| **Contexto** | API REST mantenible y escalable, entregada en un plazo de 2 días. |
| **Decisión** | Separar transporte (`routes`, `controllers`), lógica de negocio (`services`), persistencia (`models`) y aspectos transversales (`middlewares`). |
| **Alternativas descartadas** | *Clean Architecture estricta*: demasiado código repetitivo (mappers, interfaces) para el plazo. *Todo en el controlador*: mucho acoplamiento y difícil de mantener. |
| **Consecuencias** | Responsabilidades claras, código fácil de leer y escalable. Se debe mantener con las buenas prácticas  |

### ADR 02: Roles con enum en lugar de colección

| | |
|---|---|
| **Contexto** | Se requieren dos niveles de permisos: administradores y usuarios estándar. |
| **Decisión** | Campo `role` de tipo texto validado con un `enum` de Mongoose (`ADMIN`, `USER`): garantiza la integridad sin sobreingeniería para un conjunto de roles fijo. |
| **Evolución futura** | Si se necesitan permisos dinámicos por empresa o usuarios estándar con excepciones, se puede migrar a colecciones de `Roles` y `Permissions`. El cambio quedaría en el modelo y en el middleware `authorize`, sin tocar controladores ni services. |