from datetime import datetime

from app.core.extensions import db


class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False)
    provider = db.Column(db.String(40), nullable=False, default='MERCADOPAGO')
    provider_payment_id = db.Column(db.String(120), nullable=True)
    provider_preference_id = db.Column(db.String(120), nullable=True)
    status = db.Column(db.String(40), nullable=False, default='PENDING')
    raw_payload_json = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'provider': self.provider,
            'provider_payment_id': self.provider_payment_id,
            'provider_preference_id': self.provider_preference_id,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
        }
