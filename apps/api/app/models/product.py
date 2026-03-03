from datetime import datetime

from app.core.extensions import db


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(180), nullable=False)
    name = db.Column(db.String(180), nullable=False)
    sku = db.Column(db.String(60), unique=True, nullable=True)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    is_offer = db.Column(db.Boolean, nullable=False, default=False)
    offer_price = db.Column(db.Numeric(10, 2), nullable=True)
    category = db.Column(db.String(120), nullable=True)
    tags = db.Column(db.String(500), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    images = db.relationship('ProductImage', back_populates='product', cascade='all, delete-orphan')

    def effective_price(self):
        return self.offer_price if self.is_offer and self.offer_price is not None else self.price

    def to_dict(self, with_images: bool = True):
        return {
            'id': self.id,
            'title': self.title,
            'sku': self.sku,
            'description': self.description,
            'price': float(self.price),
            'stock': self.stock,
            'is_active': self.is_active,
            'is_offer': self.is_offer,
            'offer_price': float(self.offer_price) if self.offer_price is not None else None,
            'effective_price': float(self.effective_price()),
            'category': self.category,
            'tags': self.tags,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'images': [img.to_dict() for img in sorted(self.images, key=lambda i: i.sort_order)] if with_images else [],
        }
