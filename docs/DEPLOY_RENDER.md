# Deploy backend en Render (Web Service)

## Servicio

- Type: **Web Service**
- Root Directory: `apps/api`
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn wsgi:app`

## Variables de entorno mínimas

- `FLASK_ENV=production`
- `SECRET_KEY=<secret>`
- `DATABASE_URL=<render postgres url>`
- `CORS_ORIGINS=https://<frontend>.onrender.com`
- `LOG_LEVEL=INFO`
- `ENABLE_ECOMMERCE=true|false`

## Variables e-commerce

- `DELIVERY_ALLOWED_AREAS=Villa Maipú`
- `ADMIN_EMAIL=...`
- `ADMIN_PASSWORD=...`
- `ADMIN_JWT_SECRET=...`
- `ADMIN_JWT_EXPIRES_MINUTES=720`

## Mercado Pago

- `MP_ACCESS_TOKEN=...`
- `MP_WEBHOOK_SECRET=...`
- `MP_BASE_URL=https://api.mercadopago.com`

Webhook público:

- `https://<tu-backend>.onrender.com/api/payments/mercadopago/webhook`
- Enviar header `x-webhook-secret` con el valor de `MP_WEBHOOK_SECRET`.

## Email

- `EMAIL_PROVIDER=log` (MVP)
- `EMAIL_FROM=no-reply@...`
- `SITE_EMAIL=mafaldalibreria@hotmail.com`

## Migraciones

Estrategia segura:

```bash
cd apps/api
flask --app manage.py db upgrade
```

Si tu entorno local lo requiere:

```bash
cd apps/api
PYTHONPATH=. flask --app manage.py db upgrade
```

## Seguridad mínima

- CORS restringido a dominios concretos.
- No loggear tokens ni secretos.
- Mantener `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET` en Render env vars.
