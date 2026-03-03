import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-me')
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO').upper()

    _db_url = os.getenv('DATABASE_URL', 'sqlite:///mafalda.db')
    if _db_url.startswith('postgres://'):
        _db_url = _db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    _cors = os.getenv('CORS_ORIGINS', 'http://localhost:5173')
    CORS_ORIGINS = [origin.strip() for origin in _cors.split(',') if origin.strip()]

    SITE_NAME = 'Librería Mafalda'
    SITE_ADDRESS = 'Estrada 2380, B1650 Villa Maipú, Provincia de Buenos Aires'
    SITE_PHONE = '1123971452' #'01131875770'
    SITE_EMAIL = 'facumoreno2001@gmail.com'  # 'mafaldalibreria@hotmail.com'
    SITE_HOURS = [
        {'day': 'Lunes a viernes', 'time': '9:00 a 15:00'},
        {'day': 'Sábados', 'time': '9:00 a 13:00'},
    ]


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite+pysqlite:///:memory:'


CONFIG_MAP = {
    'development': Config,
    'production': Config,
    'testing': TestingConfig,
}


def get_config(config_name: str | None = None):
    return CONFIG_MAP.get(config_name or os.getenv('FLASK_ENV', 'development'), Config)
