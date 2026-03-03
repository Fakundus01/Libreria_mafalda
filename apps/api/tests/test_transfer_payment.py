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
