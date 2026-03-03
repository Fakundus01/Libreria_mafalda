from flask import Blueprint, jsonify, request

from app.services.payment_service import PaymentError, create_mp_preference, process_webhook


payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments/mercadopago')


@payments_bp.post('/create-preference')
def create_preference():
    payload = request.get_json(silent=True) or {}
    order_id = payload.get('order_id')
    if not order_id:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': 'order_id es obligatorio'}}), 400

    try:
        data = create_mp_preference(int(order_id))
    except PaymentError as exc:
        return jsonify({'ok': False, 'error': {'code': 'payment_error', 'message': str(exc)}}), 400

    return jsonify({'ok': True, 'data': data})


@payments_bp.post('/webhook')
def webhook():
    payload = request.get_json(silent=True) or {}
    webhook_secret = request.headers.get('x-webhook-secret')
    try:
        result = process_webhook(payload, webhook_secret)
    except PaymentError as exc:
        return jsonify({'ok': False, 'error': {'code': 'payment_error', 'message': str(exc)}}), 401
    return jsonify(result)
