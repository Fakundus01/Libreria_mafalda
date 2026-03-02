# Deploy backend en Render (Web Service)

Guía para desplegar **apps/api** como servicio web.

## Configuración

- **Service Type:** Web Service
- **Root Directory:** `apps/api`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn wsgi:app`

## Variables de entorno

- `FLASK_ENV=production`
- `SECRET_KEY=<valor-seguro>`
- `DATABASE_URL=<internal postgres url>`
- `CORS_ORIGINS=<url frontend, separadas por coma si hay varias>`
- `LOG_LEVEL=INFO`

> El backend normaliza automáticamente `postgres://` a `postgresql://`.

## Migraciones en producción

Estrategia segura recomendada:

1. Deploy del servicio.
2. Ejecutar manualmente migraciones desde Shell de Render:
   ```bash
   flask --app manage.py db upgrade
   ```

Alternativa: usar **Release Command** con `flask --app manage.py db upgrade` si el flujo de tu equipo lo permite.

## Troubleshooting

- **Error de conexión DB:** verificar credenciales en `DATABASE_URL` y red interna del servicio Postgres.
- **Errores CORS:** revisar `CORS_ORIGINS` y asegurar que incluya el dominio frontend con protocolo.
- **`ModuleNotFoundError`:** confirmar que Root Directory sea `apps/api`.
