from flask import current_app
from itsdangerous import BadSignature, BadTimeSignature, URLSafeTimedSerializer

from app.core.extensions import db
from app.models import User


class AuthError(ValueError):
    pass


def _serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config['ADMIN_JWT_SECRET'])


def generate_token(*, user_id: int, email: str, role: str) -> str:
    return _serializer().dumps({'uid': user_id, 'sub': email, 'role': role})


def decode_token(token: str):
    max_age = current_app.config['ADMIN_JWT_EXPIRES_MINUTES'] * 60
    try:
        return _serializer().loads(token, max_age=max_age)
    except (BadSignature, BadTimeSignature) as exc:
        raise AuthError('Token inválido o expirado.') from exc


def verify_admin_credentials(email: str, password: str) -> bool:
    return email == current_app.config['ADMIN_EMAIL'] and password == current_app.config['ADMIN_PASSWORD']


def ensure_admin_user() -> User:
    admin = User.query.filter_by(email=current_app.config['ADMIN_EMAIL']).first()
    if admin:
        return admin
    admin = User(
        email=current_app.config['ADMIN_EMAIL'],
        full_name='Administrador',
        role='ADMIN',
        phone=None,
    )
    admin.set_password(current_app.config['ADMIN_PASSWORD'])
    db.session.add(admin)
    db.session.commit()
    return admin


def signup_customer(email: str, password: str, full_name: str, phone: str | None = None) -> User:
    existing = User.query.filter_by(email=email).first()
    if existing:
        raise AuthError('El email ya está registrado.')

    user = User(email=email, full_name=full_name, phone=phone, role='CUSTOMER')
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user


def login_user(email: str, password: str) -> User:
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        raise AuthError('Credenciales inválidas.')
    return user
