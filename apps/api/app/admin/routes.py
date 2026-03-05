import os
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request, url_for
from werkzeug.utils import secure_filename

from app.core.auth import admin_required
from app.core.extensions import db
from app.models import Order, OrderItem, OrderStatus, PrintRequest, Product, ProductImage
from app.services.auth_service import ensure_admin_user, generate_token, verify_admin_credentials
from app.services.email_service import send_order_status_changed, send_print_status_changed
from app.services.order_service import list_orders
from app.services.payment_service import PaymentError, update_transfer_status


admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}


def _product_query():
    return Product.query.order_by(Product.created_at.desc())


@admin_bp.post('/auth/login')
def admin_login():
    payload = request.get_json(silent=True) or {}
    email = (payload.get('email') or '').strip().lower()
    password = (payload.get('password') or '').strip()

    if not verify_admin_credentials(email, password):
        return jsonify({'ok': False, 'error': {'code': 'invalid_credentials', 'message': 'Credenciales invalidas'}}), 401

    admin = ensure_admin_user()
    token = generate_token(user_id=admin.id, email=admin.email, role='ADMIN')
    return jsonify({'ok': True, 'token': token})


@admin_bp.get('/orders')
@admin_required
def admin_orders():
    status = request.args.get('status')
    limit = min(int(request.args.get('limit', 50)), 100)
    offset = max(int(request.args.get('offset', 0)), 0)
    orders = list_orders(status=status, limit=limit, offset=offset)
    return jsonify({'ok': True, 'data': [order.to_dict() for order in orders]})


@admin_bp.get('/orders/<string:order_code>')
@admin_required
def admin_order_detail(order_code: str):
    order = Order.query.filter_by(order_code=order_code).first()
    if not order:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'No encontramos lo que buscas.'}}), 404
    return jsonify({'ok': True, 'data': order.to_dict()})


@admin_bp.patch('/orders/<string:order_code>')
@admin_required
def admin_update_order(order_code: str):
    order = Order.query.filter_by(order_code=order_code).first()
    if not order:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'No encontramos lo que buscas.'}}), 404

    payload = request.get_json(silent=True) or {}
    status = (payload.get('status') or '').upper()
    valid = {item.value for item in OrderStatus}
    if status not in valid:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': 'Estado invalido'}}), 400

    order.status = status
    db.session.commit()
    send_order_status_changed(order)
    return jsonify({'ok': True, 'data': order.to_dict()})


@admin_bp.patch('/payments/transfer/<string:order_code>')
@admin_required
def admin_transfer_status(order_code: str):
    payload = request.get_json(silent=True) or {}
    status = (payload.get('status') or '').upper()
    if status not in {'APPROVED', 'REJECTED'}:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': 'Estado invalido'}}), 400
    try:
        data = update_transfer_status(order_code, status)
    except PaymentError as exc:
        return jsonify({'ok': False, 'error': {'code': 'payment_error', 'message': str(exc)}}), 404
    return jsonify({'ok': True, 'data': data})


@admin_bp.get('/products')
@admin_required
def admin_products():
    return jsonify({'ok': True, 'data': [product.to_dict() for product in _product_query().all()]})


@admin_bp.post('/products')
@admin_required
def admin_create_product():
    payload = request.get_json(silent=True) or {}
    title = (payload.get('title') or '').strip()
    sku = (payload.get('sku') or '').strip() or None
    price = payload.get('price')
    stock = int(payload.get('stock', 0))
    if not title or price is None:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': 'title y price son obligatorios'}}), 400

    product = Product(
        title=title,
        name=title,
        sku=sku,
        description=payload.get('description'),
        price=price,
        stock=stock,
        is_active=bool(payload.get('is_active', True)),
        is_offer=bool(payload.get('is_offer', False)),
        offer_price=payload.get('offer_price'),
        category=payload.get('category'),
        tags=payload.get('tags'),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({'ok': True, 'data': product.to_dict()}), 201


@admin_bp.put('/products/<int:product_id>')
@admin_required
def admin_update_product(product_id: int):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'No encontramos lo que buscas.'}}), 404

    payload = request.get_json(silent=True) or {}
    for attr in ['title', 'description', 'price', 'stock', 'is_active', 'is_offer', 'offer_price', 'sku', 'category', 'tags']:
        if attr in payload:
            setattr(product, attr, payload[attr])
    if 'title' in payload:
        product.name = payload['title']

    db.session.commit()
    return jsonify({'ok': True, 'data': product.to_dict()})


@admin_bp.delete('/products/<int:product_id>')
@admin_required
def admin_delete_product(product_id: int):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'No encontramos lo que buscas.'}}), 404
    db.session.delete(product)
    db.session.commit()
    return jsonify({'ok': True})


@admin_bp.post('/products/<int:product_id>/images')
@admin_required
def admin_create_product_image(product_id: int):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'No encontramos lo que buscas.'}}), 404

    payload = request.get_json(silent=True) or {}
    url = (payload.get('url') or '').strip()
    if not url:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': 'url es obligatoria'}}), 400

    image = ProductImage(product_id=product.id, url=url, sort_order=int(payload.get('sort_order', len(product.images))))
    db.session.add(image)
    db.session.commit()
    return jsonify({'ok': True, 'data': image.to_dict()}), 201


@admin_bp.post('/products/<int:product_id>/images/upload')
@admin_required
def admin_upload_product_images(product_id: int):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'No encontramos lo que buscas.'}}), 404

    files = request.files.getlist('images')
    if not files:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': 'Debes adjuntar al menos una imagen.'}}), 400

    upload_dir = os.path.join(current_app.config['UPLOAD_ROOT'], 'products')
    os.makedirs(upload_dir, exist_ok=True)

    created = []
    sort_order = len(product.images)
    for file in files:
        original_name = secure_filename(file.filename or '')
        ext = os.path.splitext(original_name)[1].lower()
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            continue

        stored_name = f'{product.id}-{uuid4().hex}{ext}'
        file_path = os.path.join(upload_dir, stored_name)
        file.save(file_path)

        public_url = url_for('media_file', filename=f'products/{stored_name}', _external=True)
        image = ProductImage(product_id=product.id, url=public_url, sort_order=sort_order)
        db.session.add(image)
        created.append(image)
        sort_order += 1

    if not created:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': 'Solo aceptamos archivos jpg, jpeg, png, webp o gif.'}}), 400

    db.session.commit()
    return jsonify({'ok': True, 'data': [image.to_dict() for image in created]})


@admin_bp.delete('/product-images/<int:image_id>')
@admin_required
def admin_delete_product_image(image_id: int):
    image = db.session.get(ProductImage, image_id)
    if not image:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'No encontramos lo que buscas.'}}), 404
    db.session.delete(image)
    db.session.commit()
    return jsonify({'ok': True})


@admin_bp.get('/prints')
@admin_required
def admin_prints():
    items = PrintRequest.query.order_by(PrintRequest.created_at.desc()).all()
    return jsonify({'ok': True, 'data': [item.to_dict() for item in items]})


@admin_bp.patch('/prints/<string:print_code>')
@admin_required
def admin_patch_print(print_code: str):
    item = PrintRequest.query.filter_by(print_code=print_code).first()
    if not item:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'No encontramos lo que buscas.'}}), 404
    payload = request.get_json(silent=True) or {}
    status = (payload.get('status') or '').upper()
    if status not in {'RECEIVED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELED'}:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': 'Estado invalido'}}), 400
    item.status = status
    db.session.commit()
    send_print_status_changed(item)
    return jsonify({'ok': True, 'data': item.to_dict()})


@admin_bp.get('/metrics')
@admin_required
def admin_metrics():
    paid_statuses = ['PAID', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'COMPLETED']
    total_sales = float(db.session.query(db.func.coalesce(db.func.sum(Order.total_amount), 0)).filter(Order.status.in_(paid_statuses)).scalar())
    orders_count = db.session.query(db.func.count(Order.id)).scalar() or 0
    avg_ticket = float(total_sales / orders_count) if orders_count else 0.0

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
                'orders_count': int(orders_count),
                'avg_ticket': avg_ticket,
                'top_products': [{'title': row[0], 'units': int(row[1])} for row in top_products],
            },
        }
    )
