from app.models import Order, Payment

def test_transfer_create_and_status(client):
    order_res = client.post(
        '/api/orders',
        json={
            'name': 'Cliente',
            'email': 'cliente@mail.com',
            'fulfillment_type': 'PICKUP',
            'items': [{'product_id': 1, 'qty': 1}],
        },
    )
    order_code = order_res.get_json()['data']['order_code']

    transfer_res = client.post('/api/payments/transfer/create', json={'order_code': order_code})
    assert transfer_res.status_code == 200
    assert transfer_res.get_json()['data']['order_code'] == order_code

    status_res = client.get(f'/api/payments/transfer/status/{order_code}')
    assert status_res.status_code == 200
    assert status_res.get_json()['data']['status'] == 'PENDING'


def test_mp_webhook_marks_order_paid(client, app_instance):
    order_res = client.post(
        '/api/orders',
        json={
            'name': 'Cliente MP',
            'email': 'cliente.mp@mail.com',
            'fulfillment_type': 'PICKUP',
            'items': [{'product_id': 1, 'qty': 1}],
        },
    )
    order_payload = order_res.get_json()['data']

    preference_res = client.post('/api/payments/mercadopago/create-preference', json={'order_id': order_payload['id']})
    assert preference_res.status_code == 200
    preference_id = preference_res.get_json()['data']['preference_id']

    webhook_res = client.post(
        '/api/payments/mercadopago/webhook',
        json={'type': 'payment', 'preference_id': preference_id, 'status': 'approved'},
    )
    assert webhook_res.status_code == 200
    assert webhook_res.get_json()['payment_status'] == 'APPROVED'

    with app_instance.app_context():
        order = Order.query.filter_by(order_code=order_payload['order_code']).first()
        payment = Payment.query.filter_by(order_id=order.id, provider='MERCADOPAGO').first()
        assert order.status == 'PAID'
        assert payment.status == 'APPROVED'
