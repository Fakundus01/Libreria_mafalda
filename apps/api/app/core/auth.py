from functools import wraps

from flask import jsonify, request

from app.services.auth_service import AuthError, decode_admin_token


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip()
        if not token:
            return jsonify({'ok': False, 'error': {'code': 'unauthorized', 'message': 'Token requerido'}}), 401
        try:
            decode_admin_token(token)
        except AuthError as exc:
            return jsonify({'ok': False, 'error': {'code': 'unauthorized', 'message': str(exc)}}), 401
        return fn(*args, **kwargs)

    return wrapper
