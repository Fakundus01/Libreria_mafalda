from datetime import datetime
from decimal import Decimal

from flask import current_app, g

from app.core.extensions import db
from app.models import FulfillmentType, Order, OrderItem, OrderStatus, Product
from app.services.email_service import send_order_created_email


class OrderValidationError(ValueError):
    pass


def _build_order_code() -> str:
    year = datetime.utcnow().year
    seq = Order.query.count() + 1
    return f'MF-{year}-{seq:06d}'


def _validate_delivery(fulfillment_type: str, delivery_address: dict | None):
    if fulfillment_type == FulfillmentType.PICKUP.value:
        return None

    if not delivery_address:
        raise OrderValidationError('Debe completar dirección para envío.')

    area = (delivery_address.get('area') or delivery_address.get('barrio') or '').strip().lower()
    allowed_areas = current_app.config['DELIVERY_ALLOWED_AREAS']
    if area not in allowed_areas:
        raise OrderValidationError('Solo realizamos envíos en Villa Maipú.')

    return delivery_address


def create_order(payload: dict) -> Order:
    customer_name = (payload.get('name') or '').strip()
    customer_email = (payload.get('email') or '').strip()
    customer_phone = (payload.get('phone') or '').strip() or None
    fulfillment_type = (payload.get('fulfillment_type') or '').strip().upper()
    items = payload.get('items') or []

    if not customer_name or not customer_email:
        raise OrderValidationError('Nombre y email son obligatorios.')

    if fulfillment_type not in {FulfillmentType.PICKUP.value, FulfillmentType.DELIVERY.value}:
        raise OrderValidationError('Tipo de entrega inválido.')

    if not isinstance(items, list) or not items:
        raise OrderValidationError('El carrito no puede estar vacío.')

    delivery_address = _validate_delivery(fulfillment_type, payload.get('delivery_address'))

    order = Order(
        order_code=_build_order_code(),
        user_id=g.auth['uid'] if getattr(g, 'auth', None) else None,
        customer_name=customer_name,
        customer_email=customer_email,
        customer_phone=customer_phone,
        fulfillment_type=fulfillment_type,
        status=OrderStatus.PENDING_PAYMENT.value,
        delivery_address_json=delivery_address,
        total_amount=Decimal('0.00'),
    )

    total = Decimal('0.00')
    for item in items:
        product_id = item.get('product_id')
        qty = int(item.get('qty', 0))

        if qty <= 0:
            raise OrderValidationError('Cantidad inválida en carrito.')

        product = db.session.get(Product, product_id)
        if not product or not product.is_active:
            raise OrderValidationError(f'Producto inválido: {product_id}')

        if product.stock < qty:
            raise OrderValidationError(f'Stock insuficiente para {product.title}.')

        product.stock -= qty
        unit_price = product.effective_price()
        subtotal = unit_price * qty
        total += subtotal

        order.items.append(
            OrderItem(
                product_id=product.id,
                title_snapshot=product.title,
                unit_price_snapshot=unit_price,
                quantity=qty,
                subtotal=subtotal,
            )
        )

    order.total_amount = total
    db.session.add(order)
    db.session.commit()
    send_order_created_email(order)
    return order


def list_orders(status: str | None = None, limit: int = 50, offset: int = 0):
    query = Order.query.order_by(Order.created_at.desc())
    if status:
        query = query.filter(Order.status == status)
    return query.offset(offset).limit(limit).all()
