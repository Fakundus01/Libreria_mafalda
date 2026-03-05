import shutil

import pytest

from app import create_app
from app.core.config import TestingConfig
from app.core.extensions import db
from app.models import Product


@pytest.fixture()
def app_instance():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        product = Product(title='Producto test', name='Producto test', description='Desc', price=1000, stock=10, is_active=True)
        db.session.add(product)
        db.session.commit()
        yield app
        upload_root = app.config.get('UPLOAD_ROOT')
        db.session.remove()
        db.drop_all()
        if upload_root:
            shutil.rmtree(upload_root, ignore_errors=True)


@pytest.fixture()
def client(app_instance):
    return app_instance.test_client()


@pytest.fixture()
def disabled_app():
    prev = TestingConfig.ENABLE_ECOMMERCE
    TestingConfig.ENABLE_ECOMMERCE = False
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        upload_root = app.config.get('UPLOAD_ROOT')
        db.session.remove()
        db.drop_all()
        if upload_root:
            shutil.rmtree(upload_root, ignore_errors=True)
    TestingConfig.ENABLE_ECOMMERCE = prev


@pytest.fixture()
def disabled_client(disabled_app):
    return disabled_app.test_client()
