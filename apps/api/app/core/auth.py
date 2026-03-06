from functools import wraps

from flask import current_app, g, jsonify, request

from app.services.auth_service import AuthError, decode_token


def _resolve_token(header_name='Authorization', cookie_name=None) -> str:
    auth_header = request.headers.get(header_name, '')
    header_token = auth_header.replace('Bearer ', '').strip()
    if header_token:
        return header_token
    if cookie_name:
        return request.cookies.get(cookie_name, '').strip()
    return ''


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _resolve_token(cookie_name=current_app.config.get('CUSTOMER_COOKIE_NAME', 'mafalda_customer_session'))
        if not token:
            return jsonify({'ok': False, 'error': {'code': 'unauthorized', 'message': 'Sesion requerida.'}}), 401
        try:
            g.auth = decode_token(token)
        except AuthError as exc:
            return jsonify({'ok': False, 'error': {'code': 'unauthorized', 'message': str(exc)}}), 401
        return fn(*args, **kwargs)

    return wrapper


def _resolve_admin_token() -> str:
    return _resolve_token(cookie_name=current_app.config.get('ADMIN_COOKIE_NAME', 'mafalda_admin_session'))


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
