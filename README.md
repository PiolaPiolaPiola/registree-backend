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