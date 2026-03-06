from flask import Blueprint, current_app, g, jsonify, request

from app.core.auth import auth_required
from app.models import User
from app.services.auth_service import AuthError, generate_token, login_user, signup_customer
from app.services.email_service import send_signup_welcome_email


auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.post('/signup')
def signup():
    payload = request.get_json(silent=True) or {}
    email = (payload.get('email') or '').strip().lower()
    password = (payload.get('password') or '').strip()
    full_name = (payload.get('full_name') or '').strip()
    phone = (payload.get('phone') or '').strip() or None

    if not email or '@' not in email or len(password) < 6 or not full_name:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': 'Revisá nombre, email y contraseña (mínimo 6 caracteres).'}}), 400

    try:
        user = signup_customer(email=email, password=password, full_name=full_name, phone=phone)
    except AuthError as exc:
        return jsonify({'ok': False, 'error': {'code': 'signup_error', 'message': str(exc)}}), 400

    send_signup_welcome_email(user)
    token = generate_token(user_id=user.id, email=user.email, role=user.role)
    return jsonify({'ok': True, 'token': token, 'user': user.to_dict()}), 201


@auth_bp.post('/login')
def login():
    payload = request.get_json(silent=True) or {}
    email = (payload.get('email') or '').strip().lower()
    password = (payload.get('password') or '').strip()

    try:
        user = login_user(email, password)
    except AuthError as exc:
        return jsonify({'ok': False, 'error': {'code': 'login_error', 'message': str(exc)}}), 401

    token = generate_token(user_id=user.id, email=user.email, role=user.role)
    response = jsonify({'ok': True, 'token': token, 'user': user.to_dict()})

    if user.role == 'ADMIN':
        response.set_cookie(
            current_app.config['ADMIN_COOKIE_NAME'],
            token,
            max_age=current_app.config['ADMIN_JWT_EXPIRES_MINUTES'] * 60,
            httponly=True,
            secure=current_app.config['ADMIN_COOKIE_SECURE'],
            samesite=current_app.config['ADMIN_COOKIE_SAMESITE'],
            path='/',
        )

    return response


@auth_bp.get('/me')
@auth_required
def me():
    from app.core.extensions import db
    user = db.session.get(User, g.auth['uid'])
    if not user:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'Usuario no encontrado.'}}), 404
    return jsonify({'ok': True, 'user': user.to_dict()})
