# Librería Mafalda - Monorepo

Proyecto demo comercial con frontend y backend separados, incluyendo módulo e-commerce modular (activable/desactivable).

## Estructura

- `apps/web`: frontend (Vite + React + Tailwind)
- `apps/api`: backend (Flask + SQLAlchemy + Alembic + PostgreSQL)

## Feature flag e-commerce (removible)

- Backend: `ENABLE_ECOMMERCE=true|false`
- Frontend: `VITE_ENABLE_ECOMMERCE=true|false`

Si está en `false`, el sitio principal sigue operativo (landing + contacto) y la tienda queda fuera de servicio.

## Documentación

- Frontend: `apps/web/README.md`
- API endpoints: `docs/API.md`
- Deploy backend en Render: `docs/DEPLOY_RENDER.md`
