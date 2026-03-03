from app.core.extensions import db


class ProductImage(db.Model):
    __tablename__ = 'product_images'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    sort_order = db.Column(db.Integer, nullable=False, default=0)

    product = db.relationship('Product', back_populates='images')

    def to_dict(self):
        return {'id': self.id, 'product_id': self.product_id, 'url': self.url, 'sort_order': self.sort_order}
