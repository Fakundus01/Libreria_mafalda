# Librería Mafalda API (Backend MVP + Ecommerce + Impresiones)

Backend Flask modular con feature flag para habilitar/deshabilitar ecommerce sin romper el sitio institucional.

## Setup local (Linux/macOS)

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
flask --app manage.py db upgrade
python scripts/seed.py
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
python scripts/seed.py
flask --app manage.py run --debug
```

## Variables clave

- `ENABLE_ECOMMERCE=true|false`
- `DATABASE_URL`
- `CORS_ORIGINS`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`
- `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`
- `EMAIL_PROVIDER`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`

## Migraciones

```bash
flask --app manage.py db migrate -m "descripcion"
flask --app manage.py db upgrade
```

## Tests

```bash
pytest
```
