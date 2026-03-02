from flask import current_app


def get_site_data():
    return {
        'name': current_app.config['SITE_NAME'],
        'address': current_app.config['SITE_ADDRESS'],
        'phone': current_app.config['SITE_PHONE'],
        'email': current_app.config['SITE_EMAIL'],
        'hours': current_app.config['SITE_HOURS'],
    }
