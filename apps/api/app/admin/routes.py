from flask import Blueprint, jsonify, request

from app.core.auth import admin_required
from app.core.extensions import db
from app.models import Order, OrderItem, OrderStatus, Product, ProductImage
from app.services.auth_service import generate_admin_token, verify_admin_credentials
from app.services.order_service import list_orders


admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.post('/auth/login')
def admin_login():
    payload = request.get_json(silent=True) or {}
    email = (payload.get('email') or '').strip()
    password = (payload.get('password') or '').strip()

    if not verify_admin_credentials(email, password):
        return jsonify({'ok': False, 'error': {'code': 'invalid_credentials', 'message': 'Credenciales inválidas'}}), 401

    token = generate_admin_token(email)
    return jsonify({'ok': True, 'token': token})


@admin_bp.get('/orders')
@admin_required
def admin_orders():
    status = request.args.get('status')
    limit = min(int(request.args.get('limit', 50)), 100)
    offset = max(int(request.args.get('offset', 0)), 0)
    orders = list_orders(status=status, limit=limit, offset=offset)
    return jsonify({'ok': True, 'data': [order.to_dict() for order in orders]})


@admin_bp.get('/orders/<int:order_id>')
@admin_required
def admin_order_detail(order_id: int):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'Orden no encontrada'}}), 404
    return jsonify({'ok': True, 'data': order.to_dict()})


@admin_bp.patch('/orders/<int:order_id>')
@admin_required
def admin_update_order(order_id: int):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'Orden no encontrada'}}), 404

    payload = request.get_json(silent=True) or {}
    status = (payload.get('status') or '').upper()
    valid = {item.value for item in OrderStatus}
    if status not in valid:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': 'Estado inválido'}}), 400

    order.status = status
    db.session.commit()
    return jsonify({'ok': True, 'data': order.to_dict()})


@admin_bp.post('/products')
@admin_required
def admin_create_product():
    payload = request.get_json(silent=True) or {}
    title = (payload.get('title') or '').strip()
    price = payload.get('price')
    stock = int(payload.get('stock', 0))
    if not title or price is None:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': 'title y price son obligatorios'}}), 400

    product = Product(
        title=title,
        name=title,
        description=payload.get('description'),
        price=price,
        stock=stock,
        is_active=bool(payload.get('is_active', True)),
        is_offer=bool(payload.get('is_offer', False)),
        offer_price=payload.get('offer_price'),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({'ok': True, 'data': product.to_dict()}), 201


@admin_bp.put('/products/<int:product_id>')
@admin_required
def admin_update_product(product_id: int):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'Producto no encontrado'}}), 404

    payload = request.get_json(silent=True) or {}
    if 'title' in payload:
        product.title = payload['title']
        product.name = payload['title']
    if 'description' in payload:
        product.description = payload['description']
    if 'price' in payload:
        product.price = payload['price']
    if 'stock' in payload:
        product.stock = int(payload['stock'])
    if 'is_active' in payload:
        product.is_active = bool(payload['is_active'])
    if 'is_offer' in payload:
        product.is_offer = bool(payload['is_offer'])
    if 'offer_price' in payload:
        product.offer_price = payload['offer_price']

    db.session.commit()
    return jsonify({'ok': True, 'data': product.to_dict()})


@admin_bp.delete('/products/<int:product_id>')
@admin_required
def admin_delete_product(product_id: int):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'Producto no encontrado'}}), 404
    db.session.delete(product)
    db.session.commit()
    return jsonify({'ok': True})


@admin_bp.post('/products/<int:product_id>/images')
@admin_required
def admin_create_product_image(product_id: int):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'Producto no encontrado'}}), 404

    payload = request.get_json(silent=True) or {}
    url = (payload.get('url') or '').strip()
    if not url:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': 'url es obligatoria'}}), 400

    image = ProductImage(product_id=product.id, url=url, sort_order=int(payload.get('sort_order', 0)))
    db.session.add(image)
    db.session.commit()
    return jsonify({'ok': True, 'data': image.to_dict()}), 201


@admin_bp.put('/products/images/<int:image_id>')
@admin_required
def admin_update_product_image(image_id: int):
    image = ProductImage.query.get(image_id)
    if not image:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'Imagen no encontrada'}}), 404
    payload = request.get_json(silent=True) or {}
    if 'url' in payload:
        image.url = payload['url']
    if 'sort_order' in payload:
        image.sort_order = int(payload['sort_order'])
    db.session.commit()
    return jsonify({'ok': True, 'data': image.to_dict()})


@admin_bp.delete('/products/images/<int:image_id>')
@admin_required
def admin_delete_product_image(image_id: int):
    image = ProductImage.query.get(image_id)
    if not image:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'Imagen no encontrada'}}), 404
    db.session.delete(image)
    db.session.commit()
    return jsonify({'ok': True})


@admin_bp.get('/metrics')
@admin_required
def admin_metrics():
    total_sales = float(db.session.query(db.func.coalesce(db.func.sum(Order.total_amount), 0)).filter(Order.status.in_(['PAID', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED'])).scalar())
    orders_count = db.session.query(db.func.count(Order.id)).scalar()
    top_products = (
        db.session.query(OrderItem.title_snapshot, db.func.sum(OrderItem.quantity).label('units'))
        .group_by(OrderItem.title_snapshot)
        .order_by(db.func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    return jsonify(
        {
            'ok': True,
            'data': {
                'total_sales': total_sales,
                'orders_count': int(orders_count or 0),
                'top_products': [{'title': row[0], 'units': int(row[1])} for row in top_products],
            },
        }
    )
