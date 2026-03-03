# Librería Mafalda API (Backend MVP)

Backend MVP con Flask + SQLAlchemy + Alembic para demo comercial.

## Stack

- Flask (app factory + blueprints)
- Flask-SQLAlchemy
- Flask-Migrate (Alembic)
- PostgreSQL
- Gunicorn

## Setup local

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Variables de entorno

- `FLASK_ENV` (`development` / `production`)
- `SECRET_KEY`
- `DATABASE_URL` (PostgreSQL)
- `CORS_ORIGINS` (separado por comas)
- `LOG_LEVEL`
- `SITE_NAME` (opcional)
- `SITE_ADDRESS` (opcional)
- `SITE_PHONE` (opcional)
- `SITE_EMAIL` (opcional)

> Nota: si Render entrega `postgres://...`, el backend lo normaliza automáticamente a `postgresql://...`.

## Migraciones

```bash
cd apps/api
source .venv/bin/activate
flask --app manage.py db upgrade
```

Crear nueva migración:

```bash
flask --app manage.py db migrate -m "descripcion"
```

## Ejecutar en desarrollo

```bash
cd apps/api
source .venv/bin/activate
flask --app manage.py run --debug
```

## Seed opcional

```bash
cd apps/api
source .venv/bin/activate
python scripts/seed.py
```

## Tests

```bash
cd apps/api
source .venv/bin/activate
pytest
```

> Alternativa explícita (si tu shell no toma `pytest.ini`): `PYTHONPATH=. pytest`.
