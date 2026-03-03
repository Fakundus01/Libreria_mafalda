# API Backend - Librería Mafalda

Base URL local: `http://localhost:5000`

## Healthcheck

### `GET /health`

Respuesta:

```json
{ "status": "ok" }
```

## Site data

### `GET /api/site`

Devuelve datos del negocio desde configuración de entorno/app (MVP simple y estable para demo sin panel admin).

Respuesta 200:

```json
{
  "ok": true,
  "data": {
    "name": "Librería Mafalda",
    "address": "Estrada 2380, B1650 Villa Maipú, Provincia de Buenos Aires",
    "phone": "01131875770",
    "email": "mafaldalibreria@hotmail.com",
    "hours": [
      { "day": "Lunes a viernes", "time": "9:00 a 15:00" },
      { "day": "Sábados", "time": "9:00 a 13:00" }
    ]
  }
}
```

## Contacto

### `POST /api/contact`

Body:

```json
{
  "name": "Juan Pérez",
  "email": "juan@mail.com",
  "message": "Hola, quiero consultar por stock."
}
```

Validaciones:
- `name`: requerido, máximo 120
- `email`: requerido, formato básico, máximo 255
- `message`: requerido, mínimo 8, máximo 3000

Respuesta 201:

```json
{ "ok": true, "id": 1 }
```

Error 422:

```json
{
  "ok": false,
  "error": {
    "code": "validation_error",
    "fields": {
      "email": "El email no tiene un formato válido."
    }
  }
}
```

## Productos (preparación catálogo)

### `GET /api/products`

Respuesta 200:

```json
{
  "ok": true,
  "data": []
}
```

La tabla y modelo `products` ya quedan creados para evolución futura.
