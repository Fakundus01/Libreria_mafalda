# Librería Mafalda API (Backend MVP + E-commerce modular)

Backend Flask con módulo e-commerce removible por feature flag.

## Stack

- Flask (app factory + blueprints)
- Flask-SQLAlchemy + PostgreSQL
- Flask-Migrate (Alembic)
- Flask-CORS
- Gunicorn

## Setup local (Linux/macOS)

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
flask --app manage.py db upgrade
flask --app manage.py run --debug
```

## Setup local (Windows PowerShell)

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
flask --app manage.py db upgrade
flask --app manage.py run --debug
```

## Variables de entorno

### Core

- `FLASK_ENV`
- `SECRET_KEY`
- `DATABASE_URL`
- `CORS_ORIGINS`
- `LOG_LEVEL`
- `ENABLE_ECOMMERCE=true|false`

### Site config

- `SITE_NAME`
- `SITE_ADDRESS`
- `SITE_PHONE`
- `SITE_EMAIL`

### E-commerce / admin / pagos

- `DELIVERY_ALLOWED_AREAS`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_JWT_SECRET`
- `ADMIN_JWT_EXPIRES_MINUTES`
- `MP_ACCESS_TOKEN`
- `MP_WEBHOOK_SECRET`
- `MP_BASE_URL`
- `EMAIL_PROVIDER`
- `EMAIL_FROM`

> Si Render entrega `postgres://...`, el backend lo normaliza a `postgresql://...`.

## Migraciones

Crear migración:

```bash
flask --app manage.py db migrate -m "descripcion"
```

Aplicar migraciones:

```bash
flask --app manage.py db upgrade
```

## Seed opcional (8 productos + imágenes)

```bash
python scripts/seed.py
```

## Tests

```bash
pytest
```

Alternativa explícita:

```bash
PYTHONPATH=. pytest
```
