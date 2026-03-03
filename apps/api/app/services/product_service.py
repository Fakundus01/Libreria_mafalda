from app.models import Product


def list_products(active_only: bool = True):
    query = Product.query
    if active_only:
        query = query.filter_by(is_active=True)
    return query.order_by(Product.created_at.desc()).all()


def get_product(product_id: int):
    return Product.query.get(product_id)
