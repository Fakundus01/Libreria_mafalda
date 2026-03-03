from app.core.extensions import db


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    title_snapshot = db.Column(db.String(180), nullable=False)
    unit_price_snapshot = db.Column(db.Numeric(10, 2), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

    order = db.relationship('Order', back_populates='items')

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'title_snapshot': self.title_snapshot,
            'unit_price_snapshot': float(self.unit_price_snapshot),
            'quantity': self.quantity,
            'subtotal': float(self.subtotal),
        }
