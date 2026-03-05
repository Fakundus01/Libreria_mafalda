import io


def admin_token(client):
    login = client.post('/api/admin/auth/login', json={'email': 'admin@test.com', 'password': 'secret123'})
    assert login.status_code == 200
    return login.get_json()['token']


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
