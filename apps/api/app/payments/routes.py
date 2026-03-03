from flask import Blueprint, jsonify, request

from app.services.payment_service import (
    PaymentError,
    create_mp_preference,
    create_transfer,
    get_transfer_status,
    process_webhook,
)


payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments')


@payments_bp.post('/mercadopago/create-preference')
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


@payments_bp.post('/mercadopago/webhook')
def webhook():
    payload = request.get_json(silent=True) or {}
    webhook_secret = request.headers.get('x-webhook-secret')
    try:
        result = process_webhook(payload, webhook_secret)
    except PaymentError as exc:
        return jsonify({'ok': False, 'error': {'code': 'payment_error', 'message': str(exc)}}), 401
    return jsonify(result)


@payments_bp.post('/transfer/create')
def transfer_create():
    payload = request.get_json(silent=True) or {}
    order_code = (payload.get('order_code') or '').strip()
    if not order_code:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': 'order_code es obligatorio'}}), 400
    try:
        data = create_transfer(order_code)
    except PaymentError as exc:
        return jsonify({'ok': False, 'error': {'code': 'payment_error', 'message': str(exc)}}), 400
    return jsonify({'ok': True, 'data': data})


@payments_bp.get('/transfer/status/<string:order_code>')
def transfer_status(order_code: str):
    try:
        data = get_transfer_status(order_code)
    except PaymentError as exc:
        return jsonify({'ok': False, 'error': {'code': 'payment_error', 'message': str(exc)}}), 404
    return jsonify({'ok': True, 'data': data})
