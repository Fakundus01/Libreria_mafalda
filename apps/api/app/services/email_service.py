from flask import current_app


def _log_email(event: str, payload: dict):
    current_app.logger.info('email_event=%s provider=%s payload=%s', event, current_app.config['EMAIL_PROVIDER'], payload)


def send_signup_welcome_email(user):
    _log_email('signup_welcome', {'to': user.email, 'full_name': user.full_name})


def send_order_created_email(order, payment_link: str | None = None):
    _log_email('order_created', {'to': order.customer_email, 'order_id': order.id, 'payment_link': payment_link})


def send_order_paid_emails(order):
    _log_email('order_paid_business', {'to': current_app.config['SITE_EMAIL'], 'order_id': order.id})
    _log_email('order_paid_customer', {'to': order.customer_email, 'order_id': order.id})


def send_transfer_created_emails(order):
    _log_email('transfer_created_business', {'to': current_app.config['SITE_EMAIL'], 'order_id': order.id})
    _log_email('transfer_created_customer', {'to': order.customer_email, 'order_id': order.id})


def send_print_created_emails(print_request):
    _log_email('print_created_business', {'to': current_app.config['SITE_EMAIL'], 'print_code': print_request.print_code})
    _log_email('print_created_customer', {'to': print_request.customer_email, 'print_code': print_request.print_code})


def send_order_status_changed(order):
    _log_email('order_status_changed', {'to': order.customer_email, 'order_id': order.id, 'status': order.status})


def send_print_status_changed(print_request):
    _log_email('print_status_changed', {'to': print_request.customer_email, 'print_code': print_request.print_code, 'status': print_request.status})
