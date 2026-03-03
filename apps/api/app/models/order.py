from datetime import datetime
from enum import Enum

from app.core.extensions import db


class OrderStatus(str, Enum):
    PENDING_PAYMENT = 'PENDING_PAYMENT'
    PAID = 'PAID'
    PREPARING = 'PREPARING'
    READY_FOR_PICKUP = 'READY_FOR_PICKUP'
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY'
    COMPLETED = 'COMPLETED'
    CANCELED = 'CANCELED'
    FAILED = 'FAILED'


class FulfillmentType(str, Enum):
    PICKUP = 'PICKUP'
    DELIVERY = 'DELIVERY'


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    order_code = db.Column(db.String(30), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    customer_name = db.Column(db.String(160), nullable=False)
    customer_email = db.Column(db.String(255), nullable=False)
    customer_phone = db.Column(db.String(40), nullable=True)
    status = db.Column(db.String(40), nullable=False, default=OrderStatus.PENDING_PAYMENT.value)
    fulfillment_type = db.Column(db.String(20), nullable=False)
    delivery_address_json = db.Column(db.JSON, nullable=True)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    items = db.relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'order_code': self.order_code,
            'user_id': self.user_id,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'customer_phone': self.customer_phone,
            'status': self.status,
            'fulfillment_type': self.fulfillment_type,
            'delivery_address': self.delivery_address_json,
            'total_amount': float(self.total_amount),
            'created_at': self.created_at.isoformat(),
            'items': [item.to_dict() for item in self.items],
        }
