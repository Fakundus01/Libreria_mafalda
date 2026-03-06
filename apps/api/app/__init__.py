import logging
import os

from flask import Flask, send_from_directory

from . import models  # noqa: F401
from .admin.routes import admin_bp
from .api.routes import api_bp
from .auth.routes import auth_bp
from .core.config import get_config
from .core.errors import register_error_handlers
from .core.extensions import cors, db, migrate
from .ecommerce.routes import ecommerce_bp
from .payments.routes import payments_bp
from .prints.routes import prints_bp


def create_app(config_name: str | None = None) -> Flask:
    app = Flask(__name__)
    app_config = get_config(config_name)
    app.config.from_object(app_config)

    upload_root = app.config.get('UPLOAD_ROOT') or os.path.join(app.instance_path, 'uploads')
    os.makedirs(upload_root, exist_ok=True)
    app.config['UPLOAD_ROOT'] = upload_root

    logging.basicConfig(
        level=app.config['LOG_LEVEL'],
        format='%(asctime)s %(levelname)s %(name)s %(message)s',
    )

    db.init_app(app)
    migrate.init_app(app, db)

    cors.init_app(
        app,
        resources={r'/api/*': {'origins': app.config['CORS_ORIGINS']}},
        supports_credentials=True,
    )

    app.register_blueprint(api_bp)

    if app.config.get('ENABLE_ECOMMERCE', True):
        app.register_blueprint(auth_bp)
        app.register_blueprint(ecommerce_bp)
        app.register_blueprint(payments_bp)
        app.register_blueprint(prints_bp)
        app.register_blueprint(admin_bp)

    register_error_handlers(app)

    @app.get('/health')
    def healthcheck():
        return {'status': 'ok'}

    @app.get('/media/<path:filename>')
    def media_file(filename: str):
        return send_from_directory(app.config['UPLOAD_ROOT'], filename)

    return app
