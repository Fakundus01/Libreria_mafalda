def admin_token(client):
    login = client.post('/api/admin/auth/login', json={'email': 'admin@test.com', 'password': 'secret123'})
    assert login.status_code == 200
    return login.get_json()['token']


def test_admin_order_status_release_and_re_reserve_stock(client):
    create_order = client.post(
        '/api/orders',
        json={
            'name': 'Cliente',
            'email': 'cliente@mail.com',
            'fulfillment_type': 'PICKUP',
            'items': [{'product_id': 1, 'qty': 2}],
        },
    )
    order_code = create_order.get_json()['data']['order_code']

    token = admin_token(client)
    headers = {'Authorization': f'Bearer {token}'}

    failed = client.patch(f'/api/admin/orders/{order_code}', json={'status': 'FAILED'}, headers=headers)
    assert failed.status_code == 200

    products = client.get('/api/products')
    product = next(item for item in products.get_json()['data'] if item['id'] == 1)
    assert product['stock'] == 10

    preparing = client.patch(f'/api/admin/orders/{order_code}', json={'status': 'PREPARING'}, headers=headers)
    assert preparing.status_code == 200

    products_again = client.get('/api/products')
    product_again = next(item for item in products_again.get_json()['data'] if item['id'] == 1)
    assert product_again['stock'] == 8


def test_admin_audit_logs_available(client):
    token = admin_token(client)
    headers = {'Authorization': f'Bearer {token}'}

    client.post('/api/admin/products', headers=headers, json={'title': 'Audit product', 'price': 3000, 'stock': 3})

    logs = client.get('/api/admin/audit-logs', headers=headers)
    assert logs.status_code == 200
    data = logs.get_json()['data']
    assert len(data) >= 1
    assert any(item['entity_type'] == 'product' for item in data)
