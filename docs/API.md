# API Backend - Librería Mafalda

Base URL local: `http://localhost:5000`

## Feature flag e-commerce

- `ENABLE_ECOMMERCE=false`: solo quedan activos `/health`, `/api/site`, `/api/contact`.
- `ENABLE_ECOMMERCE=true`: se habilitan rutas de productos, pedidos, pagos y admin.

## Healthcheck

### `GET /health`

```json
{ "status": "ok" }
```

## Site data

### `GET /api/site`

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
{ "name": "Juan", "email": "juan@mail.com", "message": "Consulta de stock" }
```

Respuesta 201:

```json
{ "ok": true, "id": 1 }
```

## Productos (e-commerce)

### `GET /api/products`
### `GET /api/products/<id>`
### `GET /api/products/<id>/images`

Respuesta ejemplo:

```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "title": "Cuaderno Universitario",
      "price": 7500,
      "stock": 20,
      "is_offer": false,
      "offer_price": null,
      "effective_price": 7500,
      "images": [{ "id": 1, "url": "https://...", "sort_order": 0 }]
    }
  ]
}
```

## Órdenes

### `POST /api/orders`

Body:

```json
{
  "name": "Cliente",
  "email": "cliente@mail.com",
  "phone": "1133334444",
  "fulfillment_type": "DELIVERY",
  "delivery_address": { "area": "Villa Maipú", "street": "Estrada", "number": "2300", "references": "Timbre 2" },
  "items": [{ "product_id": 1, "qty": 2 }]
}
```

- Si `fulfillment_type=DELIVERY`, el área debe estar en `DELIVERY_ALLOWED_AREAS`.

Respuesta 201:

```json
{ "ok": true, "data": { "id": 10, "status": "PENDING_PAYMENT", "total_amount": 15000 } }
```

### `GET /api/orders/<id>`

(Para MVP queda expuesto; en producción se recomienda protegerlo con token de tracking o solo admin.)

## Pagos Mercado Pago

### `POST /api/payments/mercadopago/create-preference`

Body:

```json
{ "order_id": 10 }
```

Respuesta:

```json
{
  "ok": true,
  "data": {
    "checkout_url": "https://www.mercadopago.com/...",
    "preference_id": "123"
  }
}
```

### `POST /api/payments/mercadopago/webhook`

- Header recomendado: `x-webhook-secret: <MP_WEBHOOK_SECRET>`
- Actualiza pago y marca orden como `PAID` cuando el estado es `approved`.

## Admin

Auth simple con token firmado (itsdangerous) usando `ADMIN_JWT_SECRET`.

### `POST /api/admin/auth/login`

```json
{ "email": "admin@...", "password": "..." }
```

Respuesta:

```json
{ "ok": true, "token": "<jwt>" }
```

Endpoints protegidos (Bearer token):

- `GET /api/admin/orders`
- `GET /api/admin/orders/<id>`
- `PATCH /api/admin/orders/<id>`
- `GET /api/admin/metrics`
- `POST /api/admin/products`
- `PUT /api/admin/products/<id>`
- `DELETE /api/admin/products/<id>`
- `POST /api/admin/products/<id>/images`
- `PUT /api/admin/products/images/<image_id>`
- `DELETE /api/admin/products/images/<image_id>`
