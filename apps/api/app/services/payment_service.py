import json
import urllib.error
import urllib.request

from flask import current_app

from app.core.extensions import db
from app.models import Order, OrderStatus, Payment
from app.services.email_service import send_order_paid_emails


class PaymentError(ValueError):
    pass


def _post_json(url: str, payload: dict, headers: dict):
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.URLError as exc:
        raise PaymentError('No se pudo crear preferencia de pago.') from exc


def create_mp_preference(order_id: int):
    order = Order.query.get(order_id)
    if not order:
        raise PaymentError('Orden no encontrada.')

    token = current_app.config['MP_ACCESS_TOKEN']
    if not token:
        checkout_url = f'https://www.mercadopago.com/checkout/v1/redirect?pref_id=mock-{order.id}'
        payment = Payment(order_id=order.id, status='PREFERENCE_CREATED', provider_preference_id=f'mock-{order.id}')
        db.session.add(payment)
        db.session.commit()
        return {'checkout_url': checkout_url, 'preference_id': payment.provider_preference_id}

    url = f"{current_app.config['MP_BASE_URL'].rstrip('/')}/checkout/preferences"
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    body = {
        'items': [
            {
                'title': item.title_snapshot,
                'quantity': item.quantity,
                'currency_id': 'ARS',
                'unit_price': float(item.unit_price_snapshot),
            }
            for item in order.items
        ],
        'external_reference': str(order.id),
    }

    data = _post_json(url, body, headers)
    payment = Payment(
        order_id=order.id,
        status='PREFERENCE_CREATED',
        provider_preference_id=data.get('id'),
        raw_payload_json=data,
    )
    db.session.add(payment)
    db.session.commit()
    return {'checkout_url': data.get('init_point'), 'preference_id': data.get('id')}


def process_webhook(payload: dict, webhook_secret: str | None):
    expected = current_app.config['MP_WEBHOOK_SECRET']
    if expected and webhook_secret != expected:
        raise PaymentError('Webhook no autorizado.')

    event_type = payload.get('type')
    data = payload.get('data') or {}
    payment_id = data.get('id')

    if event_type != 'payment':
        return {'ok': True, 'ignored': True}

    payment = None
    if payment_id:
        payment = Payment.query.filter_by(provider_payment_id=str(payment_id)).first()

    if not payment:
        preference_id = payload.get('preference_id') or payload.get('provider_preference_id')
        if preference_id:
            payment = Payment.query.filter_by(provider_preference_id=preference_id).first()

    if not payment:
        return {'ok': True, 'ignored': True}

    status = (payload.get('status') or 'approved').lower()
    payment.provider_payment_id = str(payment_id) if payment_id else payment.provider_payment_id
    payment.status = status.upper()
    payment.raw_payload_json = payload

    if status == 'approved':
        order = Order.query.get(payment.order_id)
        if order and order.status != OrderStatus.PAID.value:
            order.status = OrderStatus.PAID.value
            send_order_paid_emails(order)

    db.session.commit()
    return {'ok': True}
