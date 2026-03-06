import os

from dotenv import load_dotenv

load_dotenv()


def str_to_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}


class Config:
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-me')
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO').upper()

    _db_url = os.getenv('DATABASE_URL', 'sqlite:///mafalda.db')
    if _db_url.startswith('postgres://'):
        _db_url = _db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    _cors = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
    CORS_ORIGINS = [origin.strip() for origin in _cors.split(',') if origin.strip()]

    ENABLE_ECOMMERCE = str_to_bool(os.getenv('ENABLE_ECOMMERCE'), default=True)

    SITE_NAME = os.getenv('SITE_NAME', 'Libreria Mafalda')
    SITE_ADDRESS = os.getenv('SITE_ADDRESS', 'Estrada 2380, B1650 Villa Maipu, Provincia de Buenos Aires')
    SITE_PHONE = os.getenv('SITE_PHONE', '01131875770')
    SITE_EMAIL = os.getenv('SITE_EMAIL', 'mafaldalibreria@hotmail.com')
    SITE_URL = os.getenv('SITE_URL', '').rstrip('/')
    SITE_HOURS = [
        {'day': 'Lunes a viernes', 'time': '9:00 a 15:00'},
        {'day': 'Sabados', 'time': '9:00 a 13:00'},
    ]

    DELIVERY_ALLOWED_AREAS = [item.strip().lower() for item in os.getenv('DELIVERY_ALLOWED_AREAS', 'Villa Maipu').split(',') if item.strip()]

    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@mafalda.local')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'change-me')
    ADMIN_JWT_SECRET = os.getenv('ADMIN_JWT_SECRET', SECRET_KEY)
    ADMIN_JWT_EXPIRES_MINUTES = int(os.getenv('ADMIN_JWT_EXPIRES_MINUTES', '720'))
    ADMIN_COOKIE_NAME = os.getenv('ADMIN_COOKIE_NAME', 'mafalda_admin_session')
    ADMIN_COOKIE_SECURE = str_to_bool(os.getenv('ADMIN_COOKIE_SECURE'), default=False)
    ADMIN_COOKIE_SAMESITE = os.getenv('ADMIN_COOKIE_SAMESITE', 'Lax')

    MP_ACCESS_TOKEN = os.getenv('MP_ACCESS_TOKEN', '')
    MP_WEBHOOK_SECRET = os.getenv('MP_WEBHOOK_SECRET', '')
    MP_BASE_URL = os.getenv('MP_BASE_URL', 'https://api.mercadopago.com')
    MP_SUCCESS_URL = os.getenv('MP_SUCCESS_URL', f'{SITE_URL}/checkout/success' if SITE_URL else '')
    MP_FAILURE_URL = os.getenv('MP_FAILURE_URL', f'{SITE_URL}/checkout/failure' if SITE_URL else '')
    MP_PENDING_URL = os.getenv('MP_PENDING_URL', f'{SITE_URL}/checkout/failure' if SITE_URL else '')
    MP_WEBHOOK_URL = os.getenv('MP_WEBHOOK_URL', f'{SITE_URL}/api/payments/mercadopago/webhook' if SITE_URL else '')

    EMAIL_PROVIDER = os.getenv('EMAIL_PROVIDER', 'log')
    EMAIL_FROM = os.getenv('EMAIL_FROM', 'no-reply@libreriamafalda.local')
    EMAIL_HOST = os.getenv('EMAIL_HOST', '')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
    EMAIL_USER = os.getenv('EMAIL_USER', '')
    EMAIL_PASS = os.getenv('EMAIL_PASS', '')

    STORAGE_PROVIDER = os.getenv('STORAGE_PROVIDER', 'local').lower()
    MEDIA_BASE_URL = os.getenv('MEDIA_BASE_URL', f'{SITE_URL}/media' if SITE_URL else '').rstrip('/') or None
    UPLOAD_ROOT = os.getenv('UPLOAD_ROOT')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', str(8 * 1024 * 1024)))


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite+pysqlite:///:memory:'
    ENABLE_ECOMMERCE = True
    ADMIN_EMAIL = 'admin@test.com'
    ADMIN_PASSWORD = 'secret123'
    ADMIN_JWT_SECRET = 'test-secret'
    UPLOAD_ROOT = os.path.join(os.getcwd(), 'instance', 'test-uploads')


CONFIG_MAP = {
    'development': Config,
    'production': Config,
    'testing': TestingConfig,
}


def get_config(config_name: str | None = None):
    return CONFIG_MAP.get(config_name or os.getenv('FLASK_ENV', 'development'), Config)
