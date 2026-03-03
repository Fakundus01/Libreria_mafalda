from flask import current_app


def send_order_paid_emails(order):
    payload = {
        'to_business': current_app.config['SITE_EMAIL'],
        'to_customer': order.customer_email,
        'subject': f'Pedido #{order.id} pagado',
    }
    current_app.logger.info('email_notification provider=%s payload=%s', current_app.config['EMAIL_PROVIDER'], payload)
    return True
