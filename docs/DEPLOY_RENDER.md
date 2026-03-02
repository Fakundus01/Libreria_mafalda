# Deploy de frontend en Render (Static Site)

Esta guía aplica **solo al frontend** (sin backend).

## Configuración base

- **Root Directory:** `apps/web`
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`

## Variables de entorno

No son obligatorias para este demo.

## Pasos

1. Crear un nuevo servicio en Render: **Static Site**.
2. Conectar el repositorio.
3. Configurar:
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. Guardar y desplegar.

## Troubleshooting

### 404 al recargar rutas (ej. `/catalogo`)

Al ser SPA con React Router, configurar **Rewrite/Fallback**:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

Esto permite que Render sirva `index.html` para rutas del cliente.

### Falló el build por versión de Node

Definir versión estable (18+ o 20+) en Render usando `NODE_VERSION` en Environment si fuera necesario.
