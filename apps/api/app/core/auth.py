from functools import wraps

from flask import current_app, g, jsonify, request

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


def _resolve_admin_token() -> str:
    auth_header = request.headers.get('Authorization', '')
    header_token = auth_header.replace('Bearer ', '').strip()
    if header_token:
        return header_token
    cookie_name = current_app.config.get('ADMIN_COOKIE_NAME', 'mafalda_admin_session')
    return request.cookies.get(cookie_name, '').strip()


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _resolve_admin_token()
        if not token:
            return jsonify({'ok': False, 'error': {'code': 'unauthorized', 'message': 'Sesion admin requerida.'}}), 401
        try:
            g.auth = decode_token(token)
        except AuthError as exc:
            return jsonify({'ok': False, 'error': {'code': 'unauthorized', 'message': str(exc)}}), 401
        if g.auth.get('role') != 'ADMIN':
            return jsonify({'ok': False, 'error': {'code': 'forbidden', 'message': 'Acceso no autorizado.'}}), 403
        return fn(*args, **kwargs)

    return wrapper
