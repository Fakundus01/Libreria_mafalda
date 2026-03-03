def test_ecommerce_products_enabled(client):
    response = client.get('/api/products')
    body = response.get_json()

    assert response.status_code == 200
    assert body['ok'] is True
    assert len(body['data']) >= 1


def test_ecommerce_routes_hidden_when_disabled(disabled_client):
    response = disabled_client.get('/api/products')
    assert response.status_code == 404
