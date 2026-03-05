from datetime import datetime

from app.core.extensions import db


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    actor_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    actor_email = db.Column(db.String(255), nullable=True)
    actor_role = db.Column(db.String(20), nullable=True)
    entity_type = db.Column(db.String(60), nullable=False)
    entity_id = db.Column(db.String(120), nullable=False)
    action = db.Column(db.String(120), nullable=False)
    before_json = db.Column(db.JSON, nullable=True)
    after_json = db.Column(db.JSON, nullable=True)
    metadata_json = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'actor_user_id': self.actor_user_id,
            'actor_email': self.actor_email,
            'actor_role': self.actor_role,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'action': self.action,
            'before': self.before_json,
            'after': self.after_json,
            'metadata': self.metadata_json,
            'created_at': self.created_at.isoformat(),
        }
