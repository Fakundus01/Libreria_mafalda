from app.core.extensions import db
from app.models import ContactMessage


def create_contact_message(name: str, email: str, message: str) -> ContactMessage:
    record = ContactMessage(name=name, email=email, message=message)
    db.session.add(record)
    db.session.commit()
    return record
