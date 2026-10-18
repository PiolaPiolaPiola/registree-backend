# registree-backend

API REST desarrollada con **Node.js**, **TypeScript**, **Express** y **MongoDB** para la gestión de inventario y dashboard gerencial de la plataforma *Registree*.

---

## Requisitos previos

* Node.js v24 LTS
* Docker Desktop para levantar MongoDB 8 en contenedor

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

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `PORT` | Puerto en el que se ejecuta la API | `3000` |
| `MONGO_URI` | Cadena de conexión a MongoDB | `mongodb://localhost:27017/registree` |
| `JWT_SECRET` | Cadena secreta para tokens JWT | Cadena aleatoria (revisar nota) |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `1d` |

> **Nota:** para generar un `JWT_SECRET` propio se puede ejecutar:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

* Levantar bd con 
```bash
docker compose up -d
```

* Para ejecución con dev, build y start, usar:
```bash
npm run dev #modo desarrollo
npm run build #modo producción para compilar
npm start #modo producción para ejecutar
```
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
└── routes/       # Definición de endpoints REST
```