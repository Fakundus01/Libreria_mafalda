import logging

from flask import Flask

from . import models  # noqa: F401
from .api.routes import api_bp
from .core.config import get_config
from .core.errors import register_error_handlers
from .core.extensions import cors, db, migrate


def create_app(config_name: str | None = None) -> Flask:
    app = Flask(__name__)
    app_config = get_config(config_name)
    app.config.from_object(app_config)

    logging.basicConfig(
        level=app.config['LOG_LEVEL'],
        format='%(asctime)s %(levelname)s %(name)s %(message)s',
    )

    db.init_app(app)
    migrate.init_app(app, db)

    cors.init_app(
        app,
        resources={r'/api/*': {'origins': app.config['CORS_ORIGINS']}},
        supports_credentials=False,
    )

    app.register_blueprint(api_bp)
    register_error_handlers(app)

    @app.get('/health')
    def healthcheck():
        return {'status': 'ok'}

    return app
