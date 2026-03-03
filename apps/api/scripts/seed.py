from decimal import Decimal

from app import create_app
from app.core.extensions import db
from app.models import ContactMessage, Product, ProductImage

app = create_app()


PRODUCTS = [
    ('Cuaderno Universitario', 'Tapa dura, 84 hojas', Decimal('7500.00'), 25, False, None),
    ('Set de resaltadores', 'Pack x6 colores', Decimal('6200.00'), 18, True, Decimal('5400.00')),
    ('Novela clásica', 'Edición bolsillo', Decimal('12900.00'), 9, False, None),
    ('Agenda semanal', 'Formato A5', Decimal('9400.00'), 13, True, Decimal('8200.00')),
    ('Kit escolar', 'Lápiz, goma, regla y sacapuntas', Decimal('15700.00'), 12, False, None),
    ('Cartuchera artesanal', 'Tela estampada', Decimal('8300.00'), 14, False, None),
    ('Block dibujo A4', '80 hojas blancas', Decimal('6800.00'), 21, False, None),
    ('Lapicera roller', 'Tinta negra, trazo fino', Decimal('2700.00'), 40, False, None),
]


with app.app_context():
    contacts = [
        ContactMessage(name='Ana Pérez', email='ana@example.com', message='Hola, quiero consultar por útiles escolares.'),
        ContactMessage(name='Carlos Díaz', email='carlos@example.com', message='¿Tienen novelas de autores argentinos?'),
        ContactMessage(name='Luisa Gómez', email='luisa@example.com', message='Necesito imprimir apuntes para la facultad.'),
    ]

    db.session.add_all(contacts)
    db.session.flush()

    for idx, (title, desc, price, stock, is_offer, offer_price) in enumerate(PRODUCTS, start=1):
        product = Product(
            title=title,
            name=title,
            description=desc,
            price=price,
            stock=stock,
            is_offer=is_offer,
            offer_price=offer_price,
        )
        db.session.add(product)
        db.session.flush()

        db.session.add_all(
            [
                ProductImage(product_id=product.id, url=f'https://placehold.co/900x600/D8C9B5/4F3E31?text={idx}-1', sort_order=0),
                ProductImage(product_id=product.id, url=f'https://placehold.co/900x600/CDBAA2/4F3E31?text={idx}-2', sort_order=1),
            ]
        )

    db.session.commit()
    print('Seed completado.')
