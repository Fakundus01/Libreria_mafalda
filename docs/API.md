# API Backend - Librería Mafalda

Base URL local: `http://localhost:5000`

## Feature flag e-commerce

- `ENABLE_ECOMMERCE=false`: solo quedan activos `/health`, `/api/site`, `/api/contact`.
- `ENABLE_ECOMMERCE=true`: se habilitan rutas de productos, pedidos, pagos y admin.

## Feature flag

- `ENABLE_ECOMMERCE=false`: quedan activos `/health`, `/api/site`, `/api/contact`.
- `ENABLE_ECOMMERCE=true`: habilita auth, e-commerce, pagos, impresiones y admin.

## Base pública

- `GET /health`
- `GET /api/site`
- `POST /api/contact`

## Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)

## Productos

- `GET /api/products`
- `GET /api/products/<id>`
- `GET /api/products/<id>/images`

## Pedidos

- `POST /api/orders` (guest o user)
- `GET /api/orders/<order_code>?email=...` (tracking)
- `GET /api/my/orders` (Bearer token)

Estados posibles:
`PENDING_PAYMENT | PAID | PREPARING | READY_FOR_PICKUP | OUT_FOR_DELIVERY | COMPLETED | CANCELED | FAILED`

## Pagos

Mercado Pago:
- `POST /api/payments/mercadopago/create-preference`
- `POST /api/payments/mercadopago/webhook`

Transferencia:
- `POST /api/payments/transfer/create`
- `GET /api/payments/transfer/status/<order_code>`

## Impresiones

- `POST /api/prints`
- `GET /api/prints/<print_code>?email=...`

## Admin (Bearer token admin)

- `POST /api/admin/auth/login`
- `GET /api/admin/orders`
- `GET /api/admin/orders/<order_code>`
- `PATCH /api/admin/orders/<order_code>`
- `PATCH /api/admin/payments/transfer/<order_code>`
- `GET /api/admin/prints`
- `PATCH /api/admin/prints/<print_code>`
- `POST /api/admin/products`
- `PUT /api/admin/products/<id>`
- `DELETE /api/admin/products/<id>`
- `POST /api/admin/products/<id>/images`
- `DELETE /api/admin/product-images/<image_id>`
- `GET /api/admin/metrics`

## Errores JSON

Formato consistente:

```json
{
  "ok": false,
  "error": {
    "code": "validation_error",
    "message": "No se pudo procesar el pago."
  }
}
```
