from functools import wraps

from flask import g, jsonify, request

from app.services.auth_service import AuthError, decode_token


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip()
        if not token:
            return jsonify({'ok': False, 'error': {'code': 'unauthorized', 'message': 'Token requerido.'}}), 401
        try:
            g.auth = decode_token(token)
        except AuthError as exc:
            return jsonify({'ok': False, 'error': {'code': 'unauthorized', 'message': str(exc)}}), 401
        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn):
    @auth_required
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if g.auth.get('role') != 'ADMIN':
            return jsonify({'ok': False, 'error': {'code': 'forbidden', 'message': 'Acceso no autorizado.'}}), 403
        return fn(*args, **kwargs)

    return wrapper
