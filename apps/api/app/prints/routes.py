from flask import Blueprint, jsonify, request

from app.models import PrintRequest
from app.services.print_service import PrintError, create_print_request


prints_bp = Blueprint('prints', __name__, url_prefix='/api')


@prints_bp.post('/prints')
def post_print():
    payload = request.get_json(silent=True) or {}
    try:
        created = create_print_request(payload)
    except PrintError as exc:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': str(exc)}}), 400
    return jsonify({'ok': True, 'data': created.to_dict()}), 201


@prints_bp.get('/prints/<string:print_code>')
def get_print(print_code: str):
    email = (request.args.get('email') or '').strip().lower()
    item = PrintRequest.query.filter_by(print_code=print_code).first()
    if not item:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'No encontramos lo que buscás.'}}), 404
    if email and item.customer_email != email:
        return jsonify({'ok': False, 'error': {'code': 'forbidden', 'message': 'No autorizado para ver esta solicitud.'}}), 403
    return jsonify({'ok': True, 'data': item.to_dict()})
