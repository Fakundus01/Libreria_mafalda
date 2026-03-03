from app.core.extensions import db
from app.models import ContactMessage


def test_contact_create_success(client, app_instance):
    payload = {
        'name': 'Juan Pérez',
        'email': 'juan@example.com',
        'message': 'Hola, quiero consultar por un producto en stock.',
    }

    response = client.post('/api/contact', json=payload)
    body = response.get_json()

    assert response.status_code == 201
    assert body['ok'] is True
    assert isinstance(body['id'], int)

    with app_instance.app_context():
        saved = db.session.get(ContactMessage, body['id'])
        assert saved is not None
        assert saved.name == payload['name']
        assert saved.email == payload['email']
        assert saved.message == payload['message']


def test_contact_validation_error(client):
    payload = {
        'name': '',
        'email': 'email-invalido',
        'message': 'corto',
    }

    response = client.post('/api/contact', json=payload)
    body = response.get_json()

    assert response.status_code == 422
    assert body['ok'] is False
    assert body['error']['code'] == 'validation_error'
    assert 'name' in body['error']['fields']
    assert 'email' in body['error']['fields']
    assert 'message' in body['error']['fields']
