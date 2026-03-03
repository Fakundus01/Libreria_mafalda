def test_create_pickup_order_success(client):
    payload = {
        'name': 'Cliente',
        'email': 'cliente@mail.com',
        'fulfillment_type': 'PICKUP',
        'items': [{'product_id': 1, 'qty': 2}],
    }
    response = client.post('/api/orders', json=payload)
    body = response.get_json()

    assert response.status_code == 201
    assert body['ok'] is True
    assert body['data']['status'] == 'PENDING_PAYMENT'


def test_create_delivery_order_outside_area_fails(client):
    payload = {
        'name': 'Cliente',
        'email': 'cliente@mail.com',
        'fulfillment_type': 'DELIVERY',
        'delivery_address': {'area': 'San Martín', 'street': 'X', 'number': '123'},
        'items': [{'product_id': 1, 'qty': 1}],
    }
    response = client.post('/api/orders', json=payload)

    assert response.status_code == 400
    assert response.get_json()['ok'] is False
