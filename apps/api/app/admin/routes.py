from flask import Blueprint, g, jsonify, request
from sqlalchemy import or_

from app.core.auth import admin_required
from app.core.extensions import db
from app.models import ContactMessage, Order, OrderItem, OrderStatus, PrintRequest, Product, ProductImage, User
from app.services.audit_service import list_audit_logs, log_audit_event
from app.services.auth_service import ensure_admin_user, generate_token, verify_admin_credentials
from app.services.email_service import send_print_status_changed
from app.services.order_service import list_orders, set_order_status
from app.services.payment_service import PaymentError, update_transfer_status
from app.services.storage_service import StorageError, delete_local_media_by_url, save_product_images


admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


def _product_query():
    query = Product.query.order_by(Product.created_at.desc())
    q = (request.args.get('q') or '').strip().lower()
    active = request.args.get('active')
    if q:
        like = f'%{q}%'
        query = query.filter(or_(Product.title.ilike(like), Product.category.ilike(like), Product.tags.ilike(like), Product.sku.ilike(like)))
    if active in {'true', 'false'}:
        query = query.filter(Product.is_active.is_(active == 'true'))
    return query


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


@admin_bp.get('/me')
@admin_required
def admin_me():
    user = db.session.get(User, g.auth['uid']) if getattr(g, 'auth', None) else None
    if not user or user.role != 'ADMIN':
        return jsonify({'ok': False, 'error': {'code': 'forbidden', 'message': 'Acceso no autorizado.'}}), 403
    return jsonify({'ok': True, 'user': user.to_dict()})


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

    updated = set_order_status(order, status, reason='admin_manual_update')
    return jsonify({'ok': True, 'data': updated.to_dict()})


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
    limit = min(int(request.args.get('limit', 100)), 200)
    offset = max(int(request.args.get('offset', 0)), 0)
    products = _product_query().offset(offset).limit(limit).all()
    return jsonify({'ok': True, 'data': [product.to_dict() for product in products]})


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
    db.session.flush()
    log_audit_event(entity_type='product', entity_id=product.id, action='product.created', after=product.to_dict())
    db.session.commit()
    return jsonify({'ok': True, 'data': product.to_dict()}), 201


@admin_bp.put('/products/<int:product_id>')
@admin_required
def admin_update_product(product_id: int):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'No encontramos lo que buscas.'}}), 404

    before = product.to_dict()
    payload = request.get_json(silent=True) or {}
    for attr in ['title', 'description', 'price', 'stock', 'is_active', 'is_offer', 'offer_price', 'sku', 'category', 'tags']:
        if attr in payload:
            setattr(product, attr, payload[attr])
    if 'title' in payload:
        product.name = payload['title']

    log_audit_event(entity_type='product', entity_id=product.id, action='product.updated', before=before, after=product.to_dict())
    db.session.commit()
    return jsonify({'ok': True, 'data': product.to_dict()})


@admin_bp.delete('/products/<int:product_id>')
@admin_required
def admin_delete_product(product_id: int):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'No encontramos lo que buscas.'}}), 404

    before = product.to_dict()
    for image in product.images:
        delete_local_media_by_url(image.url)
    db.session.delete(product)
    log_audit_event(entity_type='product', entity_id=product_id, action='product.deleted', before=before)
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
    db.session.flush()
    log_audit_event(entity_type='product_image', entity_id=image.id, action='product_image.created', after=image.to_dict(), metadata={'product_id': product.id})
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

    try:
        saved_files = save_product_images(product.id, files)
    except StorageError as exc:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': str(exc)}}), 400

    created = []
    sort_order = len(product.images)
    for item in saved_files:
        image = ProductImage(product_id=product.id, url=item['url'], sort_order=sort_order)
        db.session.add(image)
        db.session.flush()
        log_audit_event(entity_type='product_image', entity_id=image.id, action='product_image.uploaded', after=image.to_dict(), metadata={'product_id': product.id})
        created.append(image)
        sort_order += 1

    db.session.commit()
    return jsonify({'ok': True, 'data': [image.to_dict() for image in created]})


@admin_bp.delete('/product-images/<int:image_id>')
@admin_required
def admin_delete_product_image(image_id: int):
    image = db.session.get(ProductImage, image_id)
    if not image:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'No encontramos lo que buscas.'}}), 404
    before = image.to_dict()
    delete_local_media_by_url(image.url)
    db.session.delete(image)
    log_audit_event(entity_type='product_image', entity_id=image_id, action='product_image.deleted', before=before, metadata={'product_id': before['product_id']})
    db.session.commit()
    return jsonify({'ok': True})


@admin_bp.get('/customers')
@admin_required
def admin_customers():
    rows = (
        db.session.query(
            User,
            db.func.count(Order.id).label('orders_count'),
            db.func.coalesce(db.func.sum(Order.total_amount), 0).label('total_spent'),
            db.func.max(Order.created_at).label('last_order_at'),
        )
        .outerjoin(Order, Order.user_id == User.id)
        .filter(User.role == 'CUSTOMER')
        .group_by(User.id)
        .order_by(User.created_at.desc())
        .all()
    )

    data = []
    for user, orders_count, total_spent, last_order_at in rows:
        data.append(
            {
                **user.to_dict(),
                'orders_count': int(orders_count or 0),
                'total_spent': float(total_spent or 0),
                'last_order_at': last_order_at.isoformat() if last_order_at else None,
            }
        )

    return jsonify({'ok': True, 'data': data})


@admin_bp.get('/messages')
@admin_required
def admin_messages():
    items = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify({'ok': True, 'data': [item.to_dict() for item in items]})


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
    previous = item.to_dict()
    item.status = status
    log_audit_event(entity_type='print_request', entity_id=item.print_code, action='print_request.status_changed', before={'status': previous['status']}, after={'status': item.status})
    db.session.commit()
    send_print_status_changed(item)
    return jsonify({'ok': True, 'data': item.to_dict()})


@admin_bp.get('/audit-logs')
@admin_required
def admin_audit_logs():
    entity_type = request.args.get('entity_type')
    limit = min(int(request.args.get('limit', 100)), 200)
    offset = max(int(request.args.get('offset', 0)), 0)
    items = list_audit_logs(entity_type=entity_type, limit=limit, offset=offset)
    return jsonify({'ok': True, 'data': [item.to_dict() for item in items]})


@admin_bp.get('/metrics')
@admin_required
def admin_metrics():
    paid_statuses = ['PAID', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'COMPLETED']
    total_sales = float(db.session.query(db.func.coalesce(db.func.sum(Order.total_amount), 0)).filter(Order.status.in_(paid_statuses)).scalar())
    orders_count = db.session.query(db.func.count(Order.id)).scalar() or 0
    avg_ticket = float(total_sales / orders_count) if orders_count else 0.0
    products_count = db.session.query(db.func.count(Product.id)).scalar() or 0
    active_products_count = db.session.query(db.func.count(Product.id)).filter(Product.is_active.is_(True)).scalar() or 0
    customers_count = db.session.query(db.func.count(User.id)).filter(User.role == 'CUSTOMER').scalar() or 0
    print_requests_count = db.session.query(db.func.count(PrintRequest.id)).scalar() or 0
    pending_print_requests = db.session.query(db.func.count(PrintRequest.id)).filter(PrintRequest.status.in_(['RECEIVED', 'IN_PROGRESS'])).scalar() or 0
    contact_messages_count = db.session.query(db.func.count(ContactMessage.id)).scalar() or 0
    pending_orders_count = db.session.query(db.func.count(Order.id)).filter(Order.status.in_(['PENDING_PAYMENT', 'PAID', 'PREPARING'])).scalar() or 0

    top_products = (
        db.session.query(OrderItem.title_snapshot, db.func.sum(OrderItem.quantity).label('units'))
        .group_by(OrderItem.title_snapshot)
        .order_by(db.func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    low_stock_products = Product.query.filter(Product.stock <= 5).order_by(Product.stock.asc(), Product.updated_at.desc()).limit(5).all()
    recent_contacts = ContactMessage.query.order_by(ContactMessage.created_at.desc()).limit(5).all()

    return jsonify(
        {
            'ok': True,
            'data': {
                'total_sales': total_sales,
                'orders_count': int(orders_count),
                'avg_ticket': avg_ticket,
                'products_count': int(products_count),
                'active_products_count': int(active_products_count),
                'customers_count': int(customers_count),
                'print_requests_count': int(print_requests_count),
                'pending_print_requests': int(pending_print_requests),
                'contact_messages_count': int(contact_messages_count),
                'pending_orders_count': int(pending_orders_count),
                'top_products': [{'title': row[0], 'units': int(row[1])} for row in top_products],
                'low_stock_products': [product.to_dict(with_images=False) for product in low_stock_products],
                'recent_contacts': [item.to_dict() for item in recent_contacts],
            },
        }
    )
