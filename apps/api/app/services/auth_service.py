from flask import current_app
from itsdangerous import BadSignature, BadTimeSignature, URLSafeTimedSerializer


class AuthError(ValueError):
    pass


def _serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config['ADMIN_JWT_SECRET'])


def generate_admin_token(email: str) -> str:
    return _serializer().dumps({'sub': email, 'role': 'admin'})


def verify_admin_credentials(email: str, password: str) -> bool:
    return email == current_app.config['ADMIN_EMAIL'] and password == current_app.config['ADMIN_PASSWORD']


def decode_admin_token(token: str):
    max_age = current_app.config['ADMIN_JWT_EXPIRES_MINUTES'] * 60
    try:
        return _serializer().loads(token, max_age=max_age)
    except (BadSignature, BadTimeSignature) as exc:
        raise AuthError('Token inválido o expirado.') from exc
