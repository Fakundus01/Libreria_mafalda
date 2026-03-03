from app import create_app
from app.core.extensions import db
from app.models import ContactMessage, Product

app = create_app()


with app.app_context():
    contacts = [
        ContactMessage(name='Ana Pérez', email='ana@example.com', message='Hola, quiero consultar por útiles escolares.'),
        ContactMessage(name='Carlos Díaz', email='carlos@example.com', message='¿Tienen novelas de autores argentinos?'),
        ContactMessage(name='Luisa Gómez', email='luisa@example.com', message='Necesito imprimir apuntes para la facultad.'),
    ]
    products = [
        Product(name='Cuaderno Universitario', description='Tapa dura, 84 hojas', price=7500),
        Product(name='Set de resaltadores', description='Pack x6 colores', price=6200),
        Product(name='Novela clásica', description='Edición bolsillo', price=12900),
        Product(name='Agenda semanal', description='Formato A5', price=9400),
        Product(name='Kit escolar', description='Lápiz, goma, regla y sacapuntas', price=15700),
    ]

    db.session.add_all(contacts + products)
    db.session.commit()
    print('Seed completado.')
