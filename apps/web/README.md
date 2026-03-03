# Librería Mafalda Web (Frontend)

Frontend React + Vite + Tailwind integrado con ecommerce removible por flag.

## Variables

Crear `apps/web/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_ENABLE_ECOMMERCE=true
```

Si `VITE_ENABLE_ECOMMERCE=false`, rutas `/shop`, `/catalogo`, `/checkout`, `/admin` muestran pantalla de “Próximamente”.

## Ejecutar

```bash
cd apps/web
npm install
npm run dev
```
