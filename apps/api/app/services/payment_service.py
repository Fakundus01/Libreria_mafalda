import json
import urllib.error
import urllib.request

from flask import current_app

from app.core.extensions import db
from app.models import Order, OrderStatus, Payment
from app.services.audit_service import log_audit_event
from app.services.email_service import send_order_paid_emails, send_transfer_created_emails
from app.services.order_service import set_order_status


class PaymentError(ValueError):
    pass


def _post_json(url: str, payload: dict, headers: dict):
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.URLError as exc:
        raise PaymentError('No se pudo procesar el pago.') from exc


def _set_payment_status(payment: Payment, status: str, *, payload=None, actor=None):
    previous_status = payment.status
    payment.status = status
    if payload is not None:
        payment.raw_payload_json = payload
    log_audit_event(
        entity_type='payment',
        entity_id=payment.id,
        action='payment.status_changed',
        before={'status': previous_status},
        after={'status': payment.status},
        metadata={'provider': payment.provider, 'order_id': payment.order_id},
        actor=actor,
    )


def create_mp_preference(order_id: int):
    order = db.session.get(Order, order_id)
    if not order:
        raise PaymentError('Orden no encontrada.')

    token = current_app.config['MP_ACCESS_TOKEN']
    if not token:
        checkout_url = f'https://www.mercadopago.com/checkout/v1/redirect?pref_id=mock-{order.id}'
        payment = Payment(order_id=order.id, status='PENDING', provider='MERCADOPAGO', provider_preference_id=f'mock-{order.id}')
        db.session.add(payment)
        db.session.flush()
        log_audit_event(
            entity_type='payment',
            entity_id=payment.id,
            action='payment.preference_created',
            after={'status': payment.status, 'provider_preference_id': payment.provider_preference_id},
            metadata={'provider': payment.provider, 'order_code': order.order_code},
        )
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
        'external_reference': order.order_code,
    }

    data = _post_json(url, body, headers)
    payment = Payment(order_id=order.id, provider='MERCADOPAGO', status='PENDING', provider_preference_id=data.get('id'), raw_payload_json=data)
    db.session.add(payment)
    db.session.flush()
    log_audit_event(
        entity_type='payment',
        entity_id=payment.id,
        action='payment.preference_created',
        after={'status': payment.status, 'provider_preference_id': payment.provider_preference_id},
        metadata={'provider': payment.provider, 'order_code': order.order_code},
    )
    db.session.commit()
    return {'checkout_url': data.get('init_point'), 'preference_id': data.get('id')}


def create_transfer(order_code: str):
    order = Order.query.filter_by(order_code=order_code).first()
    if not order:
        raise PaymentError('Orden no encontrada.')
    payment = Payment(order_id=order.id, provider='TRANSFER', status='PENDING', raw_payload_json={'order_code': order_code})
    db.session.add(payment)
    db.session.flush()
    log_audit_event(
        entity_type='payment',
        entity_id=payment.id,
        action='payment.transfer_created',
        after={'status': payment.status},
        metadata={'provider': payment.provider, 'order_code': order.order_code},
    )
    db.session.commit()
    send_transfer_created_emails(order)
    return {
        'order_code': order.order_code,
        'status': payment.status,
        'instructions': 'Transferi al alias MAFALDA.LIBRERIA y envia comprobante por WhatsApp al 01131875770.',
        'redirect_url': f'/transfer/{order.order_code}',
    }


def get_transfer_status(order_code: str):
    order = Order.query.filter_by(order_code=order_code).first()
    if not order:
        raise PaymentError('Orden no encontrada.')
    transfer = Payment.query.filter_by(order_id=order.id, provider='TRANSFER').order_by(Payment.created_at.desc()).first()
    if not transfer:
        raise PaymentError('No existe pago por transferencia para esta orden.')
    return {'order_code': order.order_code, 'status': transfer.status}


def update_transfer_status(order_code: str, status: str, *, actor=None):
    order = Order.query.filter_by(order_code=order_code).first()
    if not order:
        raise PaymentError('Orden no encontrada.')

    transfer = Payment.query.filter_by(order_id=order.id, provider='TRANSFER').order_by(Payment.created_at.desc()).first()
    if not transfer:
        raise PaymentError('No existe pago por transferencia para esta orden.')

    _set_payment_status(transfer, status, actor=actor)
    if status == 'APPROVED':
        set_order_status(order, OrderStatus.PAID.value, reason='transfer_approved', actor=actor)
        send_order_paid_emails(order)
    elif status in {'REJECTED', 'CANCELED'}:
        set_order_status(order, OrderStatus.FAILED.value, reason='transfer_rejected', actor=actor)
    else:
        db.session.commit()
    return {'order_code': order.order_code, 'payment_status': transfer.status, 'order_status': order.status}


def process_webhook(payload: dict, webhook_secret: str | None):
    expected = current_app.config['MP_WEBHOOK_SECRET']
    if expected and webhook_secret != expected:
        raise PaymentError('Webhook no autorizado.')

    if payload.get('type') != 'payment':
        return {'ok': True, 'ignored': True}

    payment_id = (payload.get('data') or {}).get('id')
    payment = Payment.query.filter_by(provider='MERCADOPAGO', provider_payment_id=str(payment_id)).first() if payment_id else None

    if not payment:
        pref_id = payload.get('provider_preference_id') or payload.get('preference_id')
        if pref_id:
            payment = Payment.query.filter_by(provider='MERCADOPAGO', provider_preference_id=pref_id).first()

    if not payment:
        return {'ok': True, 'ignored': True}

    status = (payload.get('status') or 'approved').upper()
    normalized_status = 'APPROVED' if status == 'APPROVED' else status
    _set_payment_status(payment, normalized_status, payload=payload, actor={'actor_user_id': None, 'actor_email': 'webhook', 'actor_role': 'SYSTEM'})
    payment.provider_payment_id = str(payment_id) if payment_id else payment.provider_payment_id

    order = db.session.get(Order, payment.order_id)
    if order and payment.status == 'APPROVED':
        set_order_status(order, OrderStatus.PAID.value, reason='mercadopago_webhook', actor={'actor_user_id': None, 'actor_email': 'webhook', 'actor_role': 'SYSTEM'})
        send_order_paid_emails(order)
    else:
        db.session.commit()
    return {'ok': True}
