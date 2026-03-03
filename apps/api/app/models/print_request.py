from datetime import datetime

from app.core.extensions import db


class PrintRequest(db.Model):
    __tablename__ = 'print_requests'

    id = db.Column(db.Integer, primary_key=True)
    print_code = db.Column(db.String(30), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    customer_name = db.Column(db.String(160), nullable=False)
    customer_email = db.Column(db.String(255), nullable=False)
    customer_phone = db.Column(db.String(40), nullable=True)
    files = db.Column(db.JSON, nullable=True)
    specs = db.Column(db.JSON, nullable=False)
    status = db.Column(db.String(30), nullable=False, default='RECEIVED')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'print_code': self.print_code,
            'user_id': self.user_id,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'customer_phone': self.customer_phone,
            'files': self.files or [],
            'specs': self.specs,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
        }
