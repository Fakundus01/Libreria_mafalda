# Deploy backend en Render (Web Service)

- Root Directory: `apps/api`
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn wsgi:app`

## Variables mínimas

- `FLASK_ENV=production`
- `SECRET_KEY`
- `DATABASE_URL`
- `CORS_ORIGINS`
- `ENABLE_ECOMMERCE=true|false`

## Variables ecommerce/impresiones

- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `ADMIN_JWT_EXPIRES_MINUTES`
- `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `MP_BASE_URL`
- `EMAIL_PROVIDER`, `EMAIL_FROM`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- `DELIVERY_ALLOWED_AREAS`

## Webhook Mercado Pago

`https://<tu-backend>.onrender.com/api/payments/mercadopago/webhook`

Enviar `x-webhook-secret` con valor `MP_WEBHOOK_SECRET`.

## Migraciones

```bash
cd apps/api
flask --app manage.py db upgrade
python scripts/seed.py
```

(En Render, sugerido manual/release command separado del start command.)
