# Librería Mafalda - Monorepo

Proyecto demo comercial con frontend y backend, incluyendo ecommerce + impresiones modular por feature flags.

## Estructura

- `apps/web`: frontend (Vite + React + Tailwind)
- `apps/api`: backend (Flask + SQLAlchemy + Alembic + PostgreSQL)

## Feature flags (removible)

- Backend: `ENABLE_ECOMMERCE=true|false`
- Frontend: `VITE_ENABLE_ECOMMERCE=true|false`

Si ambos están en `false`, el sitio institucional sigue funcionando y el ecommerce queda deshabilitado.

## Documentación

- API: `docs/API.md`
- Deploy Render: `docs/DEPLOY_RENDER.md`
- Setup backend: `apps/api/README.md`
- Setup frontend: `apps/web/README.md`
