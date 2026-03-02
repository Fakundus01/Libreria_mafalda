from app.models import Product


def list_products():
    return Product.query.filter_by(is_active=True).order_by(Product.created_at.desc()).all()
