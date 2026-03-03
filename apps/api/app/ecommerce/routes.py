from flask import Blueprint, jsonify, request

from app.models import Order
from app.services.order_service import OrderValidationError, create_order
from app.services.product_service import get_product, list_products


ecommerce_bp = Blueprint('ecommerce', __name__, url_prefix='/api')


@ecommerce_bp.get('/products')
def get_products():
    products = list_products(active_only=True)
    return jsonify({'ok': True, 'data': [item.to_dict() for item in products]})


@ecommerce_bp.get('/products/<int:product_id>')
def get_product_detail(product_id: int):
    product = get_product(product_id)
    if not product or not product.is_active:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'Producto no encontrado'}}), 404
    return jsonify({'ok': True, 'data': product.to_dict()})


@ecommerce_bp.get('/products/<int:product_id>/images')
def get_product_images(product_id: int):
    product = get_product(product_id)
    if not product or not product.is_active:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'Producto no encontrado'}}), 404
    return jsonify({'ok': True, 'data': [img.to_dict() for img in sorted(product.images, key=lambda i: i.sort_order)]})


@ecommerce_bp.post('/orders')
def post_order():
    payload = request.get_json(silent=True) or {}
    try:
        order = create_order(payload)
    except OrderValidationError as exc:
        return jsonify({'ok': False, 'error': {'code': 'validation_error', 'message': str(exc)}}), 400

    return jsonify({'ok': True, 'data': {'id': order.id, 'status': order.status, 'total_amount': float(order.total_amount)}}), 201


@ecommerce_bp.get('/orders/<int:order_id>')
def get_order(order_id: int):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'ok': False, 'error': {'code': 'not_found', 'message': 'Orden no encontrada'}}), 404
    return jsonify({'ok': True, 'data': order.to_dict()})
