# Deploy del backend en Render (Web Service)

Esta guía aplica al backend Flask ubicado en `apps/api`.

## Tipo de servicio

- Crear un servicio de tipo **Web Service** (no Static Site).

## Configuración recomendada

- **Root Directory:** `apps/api`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn wsgi:app`

> `wsgi.py` expone `app = create_app()`, por eso el entrypoint para Gunicorn es `wsgi:app`.

## Variables de entorno

Configurar al menos:

- `FLASK_ENV=production`
- `SECRET_KEY=<valor-seguro>`
- `DATABASE_URL=<Render Postgres Internal URL>`
- `CORS_ORIGINS=https://<tu-frontend>.onrender.com`
- `LOG_LEVEL=INFO`

### Nota sobre `DATABASE_URL`

Render puede entregar URLs con prefijo `postgres://...`.
El backend ya normaliza automáticamente a `postgresql://...` para compatibilidad con SQLAlchemy/psycopg2.

## Base de datos (migraciones Alembic)

Estrategia segura recomendada:

1. Desplegar el servicio con variables de entorno configuradas.
2. Ejecutar migraciones manualmente una vez por release:

```bash
cd apps/api
flask --app manage.py db upgrade
```

Opciones para producción:

- **Manual (recomendada para MVP):** correr `db upgrade` controladamente antes/justo después del deploy.
- **Automatizada con Release Command (si aplica en tu plan):** definir un release command que ejecute `flask --app manage.py db upgrade`.

> Evitar correr migraciones en cada arranque de Gunicorn para no mezclar responsabilidades de runtime con cambios de esquema.

## Checklist de verificación post-deploy

- `GET /health` responde `200` con `{ "status": "ok" }`.
- `GET /api/site` responde `200` con datos del negocio.
- `GET /api/products` responde `200`.
- `POST /api/contact` persiste mensajes y retorna `201`.
- Logs de Render sin errores de conexión a DB.

## Troubleshooting rápido

### Error de conexión a PostgreSQL

- Verificar `DATABASE_URL`.
- Confirmar que el servicio web esté enlazado a una instancia Postgres activa.
- Revisar si se está usando URL interna de Render para comunicación privada.

### CORS bloqueando requests del frontend

- Revisar `CORS_ORIGINS` (coma-separado si hay más de un origen).
- Incluir dominio exacto del frontend (con protocolo https).

### `ModuleNotFoundError` al ejecutar comandos manuales

Desde `apps/api`, correr comandos con:

```bash
PYTHONPATH=. flask --app manage.py db upgrade
```

(o usar un entorno virtual correctamente activado y `cwd` en `apps/api`).
