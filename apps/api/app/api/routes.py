import re

from flask import Blueprint, current_app, jsonify, request

from app.services.contact_service import create_contact_message
from app.services.product_service import list_products
from app.services.site_service import get_site_data

api_bp = Blueprint('api', __name__, url_prefix='/api')

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


def validation_error(errors: dict):
    return jsonify({'ok': False, 'error': {'code': 'validation_error', 'fields': errors}}), 422


@api_bp.get('/site')
def get_site():
    return jsonify({'ok': True, 'data': get_site_data()})


@api_bp.post('/contact')
def post_contact():
    payload = request.get_json(silent=True) or {}

    name = (payload.get('name') or '').strip()
    email = (payload.get('email') or '').strip()
    message = (payload.get('message') or '').strip()

    errors = {}
    if not name:
        errors['name'] = 'El nombre es obligatorio.'
    elif len(name) > 120:
        errors['name'] = 'El nombre no puede superar 120 caracteres.'

    if not email:
        errors['email'] = 'El email es obligatorio.'
    elif len(email) > 255 or not EMAIL_RE.match(email):
        errors['email'] = 'El email no tiene un formato válido.'

    if not message:
        errors['message'] = 'El mensaje es obligatorio.'
    elif len(message) < 8:
        errors['message'] = 'El mensaje debe tener al menos 8 caracteres.'
    elif len(message) > 3000:
        errors['message'] = 'El mensaje no puede superar 3000 caracteres.'

    if errors:
        return validation_error(errors)

    saved = create_contact_message(name=name, email=email, message=message)
    current_app.logger.info('contact_message_created id=%s email=%s', saved.id, saved.email)

    return jsonify({'ok': True, 'id': saved.id}), 201


@api_bp.get('/products')
def get_products():
    products = list_products()
    return jsonify({'ok': True, 'data': [item.to_dict() for item in products]})
