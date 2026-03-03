from datetime import datetime

from flask import g

from app.core.extensions import db
from app.models import PrintRequest
from app.services.email_service import send_print_created_emails


class PrintError(ValueError):
    pass


def _build_print_code() -> str:
    year = datetime.utcnow().year
    seq = PrintRequest.query.count() + 1
    return f'PR-{year}-{seq:06d}'


def create_print_request(payload: dict):
    customer_name = (payload.get('customer_name') or '').strip()
    customer_email = (payload.get('customer_email') or '').strip().lower()
    if not customer_name or not customer_email:
        raise PrintError('Nombre y email son obligatorios.')

    specs = payload.get('specs') or {}
    if not isinstance(specs, dict):
        raise PrintError('Especificaciones inválidas.')

    req = PrintRequest(
        print_code=_build_print_code(),
        user_id=g.auth['uid'] if getattr(g, 'auth', None) else None,
        customer_name=customer_name,
        customer_email=customer_email,
        customer_phone=(payload.get('customer_phone') or '').strip() or None,
        files=payload.get('files') or [],
        specs=specs,
        status='RECEIVED',
    )
    db.session.add(req)
    db.session.commit()
    send_print_created_emails(req)
    return req


def update_print_status(req: PrintRequest, status: str):
    req.status = status
    db.session.commit()
    return req
