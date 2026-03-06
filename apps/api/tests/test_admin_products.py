import io


def admin_token(client):
    login = client.post('/api/admin/auth/login', json={'email': 'admin@test.com', 'password': 'secret123'})
    assert login.status_code == 200
    return login.get_json()['token']


def test_admin_me_and_metrics(client):
    token = admin_token(client)
    headers = {'Authorization': f'Bearer {token}'}

    me = client.get('/api/admin/me', headers=headers)
    assert me.status_code == 200
    assert me.get_json()['user']['role'] == 'ADMIN'

    metrics = client.get('/api/admin/metrics', headers=headers)
    assert metrics.status_code == 200
    data = metrics.get_json()['data']
    assert 'products_count' in data
    assert 'customers_count' in data
    assert 'contact_messages_count' in data

    customers = client.get('/api/admin/customers', headers=headers)
    assert customers.status_code == 200
    customer_payload = customers.get_json()['data']
    assert isinstance(customer_payload, list)
    if customer_payload:
        assert customer_payload[0]['role'] == 'CUSTOMER'
        assert 'orders_count' in customer_payload[0]
        assert 'total_spent' in customer_payload[0]

    messages = client.get('/api/admin/messages', headers=headers)
    assert messages.status_code == 200
    message_payload = messages.get_json()['data']
    assert isinstance(message_payload, list)
    if message_payload:
        assert 'message' in message_payload[0]
        assert 'email' in message_payload[0]


def test_admin_products_list_and_create(client):
    token = admin_token(client)
    headers = {'Authorization': f'Bearer {token}'}

    listed = client.get('/api/admin/products', headers=headers)
    assert listed.status_code == 200
    assert len(listed.get_json()['data']) >= 1

    created = client.post(
        '/api/admin/products',
        headers=headers,
        json={
            'title': 'Producto admin',
            'price': 1234,
            'stock': 8,
            'category': 'Test',
        },
    )
    assert created.status_code == 201
    assert created.get_json()['data']['title'] == 'Producto admin'


def test_admin_product_image_upload(client):
    token = admin_token(client)
    headers = {'Authorization': f'Bearer {token}'}

    created = client.post(
        '/api/admin/products',
        headers=headers,
        json={'title': 'Producto con imagen', 'price': 2500, 'stock': 4},
    )
    product_id = created.get_json()['data']['id']

    uploaded = client.post(
        f'/api/admin/products/{product_id}/images/upload',
        headers=headers,
        data={'images': [(io.BytesIO(b'fake-image-content'), 'demo.png')]},
        content_type='multipart/form-data',
    )

    assert uploaded.status_code == 200
    payload = uploaded.get_json()['data']
    assert len(payload) == 1
    assert '/media/products/' in payload[0]['url']


def test_admin_cookie_session_and_logout(client):
    login = client.post('/api/admin/auth/login', json={'email': 'admin@test.com', 'password': 'secret123'})
    assert login.status_code == 200
    assert 'Set-Cookie' in login.headers
    assert 'mafalda_admin_session=' in login.headers['Set-Cookie']

    me = client.get('/api/admin/me')
    assert me.status_code == 200
    assert me.get_json()['user']['role'] == 'ADMIN'

    logout = client.post('/api/admin/auth/logout')
    assert logout.status_code == 200

    me_after_logout = client.get('/api/admin/me')
    assert me_after_logout.status_code == 401
