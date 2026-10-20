# Registree · Guía rápida

Pasos mínimos para levantar el proyecto completo en local: base de datos, API y aplicación web. El detalle de cada proyecto está en su README.

| Proyecto | Repositorio |
|---|---|
| Backend (API REST) | https://github.com/PiolaPiolaPiola/registree-backend |
| Frontend (dashboard) | https://github.com/PiolaPiolaPiola/registree-frontend |

## Requisitos

* **Node.js 24 LTS** (`node -v`)
* **Docker Desktop** abierto (para MongoDB 8)
* **Git**
* Puertos libres: `27017` (MongoDB), `3000` (API) y `5173` (frontend)

---

## 1. Backend y base de datos

```bash
git clone https://github.com/PiolaPiolaPiola/registree-backend.git
cd registree-backend
npm install
cp .env.example .env
docker compose up -d
npm run seed
npm run dev
```

* `.env.example` ya trae valores que funcionan en local; no hace falta cambiarlos.
* `docker compose up -d` levanta MongoDB en un contenedor.
* `npm run seed` crea los **usuarios de prueba** y **12 productos de ejemplo**. Se puede ejecutar varias veces sin duplicar datos. El mensaje final *"La bd se encuentra desconectada"* es normal.
* Verificación: abrir http://localhost:3000/api/health → `{ "status": "Ok", "database_connected": true }`

## 2. Frontend

En otra terminal:

```bash
git clone https://github.com/PiolaPiolaPiola/registree-frontend.git
cd registree-frontend
npm install
cp .env.example .env
npm run dev
```

Abrir http://localhost:5173

## 3. Credenciales de prueba

| Rol | Email | Contraseña | Puede |
|---|---|---|---|
| `ADMIN` | `admin@registree.com` | `Admin12345` | Todo: dashboard, inventario (crear, editar, eliminar) y administración de usuarios |
| `USER` | `user@registree.com` | `User12345` | Consultar: dashboard, inventario y detalle de productos |

También se puede crear una cuenta nueva (rol `USER`) desde **"Regístrate"** en el login.

## 4. Postman

1. En Postman: **Import** → seleccionar los dos archivos de la carpeta `postman/` del backend.
2. Elegir el entorno **Registree Local** (arriba a la derecha).
3. Ejecutar **Auth → Login ADMIN** (guarda el token) y luego el resto, o toda la colección con el **Collection Runner**.

---

## Problemas comunes

| Síntoma | Solución |
|---|---|
| `database_connected: false` o error de autenticación de MongoDB | Verificar que Docker Desktop esté abierto. Si se cambió la contraseña de la bd después de crear el contenedor: `docker compose down -v` y `docker compose up -d`, luego `npm run seed` |
| El frontend muestra "No se pudo conectar con el servidor" | La API no está corriendo: `npm run dev` en el backend |
| Error de CORS en la consola del navegador | El frontend debe correr en `http://localhost:5173` (o actualizar `CORS_ORIGIN` en el `.env` del backend y reiniciarlo) |
| No aparecen productos | Ejecutar `npm run seed` en el backend |
| `cp` no se reconoce (Windows, CMD) | Usar `copy .env.example .env`, o PowerShell / Git Bash |
