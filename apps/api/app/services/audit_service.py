from flask import g

from app.core.extensions import db
from app.models import AuditLog


def _current_actor():
    auth = getattr(g, 'auth', None)
    if not auth:
        return {'actor_user_id': None, 'actor_email': 'system', 'actor_role': 'SYSTEM'}
    return {
        'actor_user_id': auth.get('uid'),
        'actor_email': auth.get('sub'),
        'actor_role': auth.get('role'),
    }


def log_audit_event(*, entity_type: str, entity_id: str | int, action: str, before=None, after=None, metadata=None, actor=None):
    payload = actor or _current_actor()
    audit = AuditLog(
        actor_user_id=payload.get('actor_user_id'),
        actor_email=payload.get('actor_email'),
        actor_role=payload.get('actor_role'),
        entity_type=entity_type,
        entity_id=str(entity_id),
        action=action,
        before_json=before,
        after_json=after,
        metadata_json=metadata,
    )
    db.session.add(audit)
    return audit


def list_audit_logs(*, entity_type: str | None = None, limit: int = 100, offset: int = 0):
    query = AuditLog.query.order_by(AuditLog.created_at.desc())
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    return query.offset(offset).limit(limit).all()
