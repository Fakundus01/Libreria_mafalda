from decimal import Decimal

from decimal import Decimal

from app import create_app
from app.core.extensions import db
from app.models import ContactMessage, Product, ProductImage
from app.services.auth_service import ensure_admin_user

app = create_app()


PRODUCTS = [
    ('SKU-001', 'Cuaderno Universitario', 'Tapa dura, 84 hojas', Decimal('7500.00'), 25, False, None),
    ('SKU-002', 'Set de resaltadores', 'Pack x6 colores', Decimal('6200.00'), 18, True, Decimal('5400.00')),
    ('SKU-003', 'Novela clásica', 'Edición bolsillo', Decimal('12900.00'), 9, False, None),
    ('SKU-004', 'Agenda semanal', 'Formato A5', Decimal('9400.00'), 13, True, Decimal('8200.00')),
    ('SKU-005', 'Kit escolar', 'Lápiz, goma, regla y sacapuntas', Decimal('15700.00'), 12, False, None),
    ('SKU-006', 'Cartuchera artesanal', 'Tela estampada', Decimal('8300.00'), 14, False, None),
    ('SKU-007', 'Block dibujo A4', '80 hojas blancas', Decimal('6800.00'), 21, False, None),
    ('SKU-008', 'Lapicera roller', 'Tinta negra, trazo fino', Decimal('2700.00'), 40, False, None),
    ('SKU-009', 'Mochila escolar', 'Reforzada, varios colores', Decimal('38900.00'), 7, False, None),
    ('SKU-010', 'Cartulina color', 'Pack x10', Decimal('3200.00'), 30, False, None),
    ('SKU-011', 'Resma A4', '500 hojas', Decimal('10500.00'), 16, False, None),
    ('SKU-012', 'Lapices de color', 'Pack x24', Decimal('8900.00'), 19, True, Decimal('7900.00')),
]


with app.app_context():
    ensure_admin_user()

    contacts = [
        ContactMessage(name='Ana Pérez', email='ana@example.com', message='Hola, quiero consultar por útiles escolares.'),
        ContactMessage(name='Carlos Díaz', email='carlos@example.com', message='¿Tienen novelas de autores argentinos?'),
        ContactMessage(name='Luisa Gómez', email='luisa@example.com', message='Necesito imprimir apuntes para la facultad.'),
    ]

    db.session.add_all(contacts)
    db.session.flush()

    for idx, (sku, title, desc, price, stock, is_offer, offer_price) in enumerate(PRODUCTS, start=1):
        product = Product(
            sku=sku,
            title=title,
            name=title,
            description=desc,
            price=price,
            stock=stock,
            is_offer=is_offer,
            offer_price=offer_price,
            category='Librería',
            tags='demo,mafalda',
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
    print('Seed completado (admin + productos demo).')
