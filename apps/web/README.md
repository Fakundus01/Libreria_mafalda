# Librería Mafalda Web (Frontend)

Frontend React + Vite + Tailwind con módulo e-commerce **removible** por feature flag.

## Variables de entorno

Crear `apps/web/.env` (o `.env.local`) con:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_ENABLE_ECOMMERCE=true
```

- Si `VITE_ENABLE_ECOMMERCE=false`: se ocultan rutas/flujo de tienda y `/shop` o `/catalogo` muestran “Próximamente”.
- Si `VITE_ENABLE_ECOMMERCE=true`: se habilitan tienda, checkout y admin.

## Ejecutar local

```bash
cd apps/web
npm install
npm run dev
```

## Build

```bash
cd apps/web
npm run build
```

## Deploy

- API y deploy backend: `../../docs/DEPLOY_RENDER.md`
- Endpoints: `../../docs/API.md`
