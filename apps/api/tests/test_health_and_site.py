def test_health(client):
    response = client.get('/health')
    assert response.status_code == 200
    assert response.get_json() == {'status': 'ok'}


def test_site(client):
    response = client.get('/api/site')
    body = response.get_json()

    assert response.status_code == 200
    assert body['ok'] is True
    assert body['data']['name'] == 'Librería Mafalda'
    assert 'hours' in body['data']
