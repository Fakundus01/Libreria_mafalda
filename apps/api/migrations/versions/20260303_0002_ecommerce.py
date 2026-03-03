"""ecommerce module schema

Revision ID: 20260303_0002
Revises: 20260302_0001
Create Date: 2026-03-03 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = '20260303_0002'
down_revision = '20260302_0001'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('products', sa.Column('title', sa.String(length=180), nullable=False, server_default='Producto'))
    op.add_column('products', sa.Column('stock', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('products', sa.Column('is_offer', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.add_column('products', sa.Column('offer_price', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('products', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')))

    op.execute('UPDATE products SET title = name WHERE title = \'Producto\'')

    op.create_table(
        'product_images',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'orders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_name', sa.String(length=160), nullable=False),
        sa.Column('customer_email', sa.String(length=255), nullable=False),
        sa.Column('customer_phone', sa.String(length=40), nullable=True),
        sa.Column('status', sa.String(length=40), nullable=False),
        sa.Column('fulfillment_type', sa.String(length=20), nullable=False),
        sa.Column('delivery_address_json', sa.JSON(), nullable=True),
        sa.Column('total_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'order_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('title_snapshot', sa.String(length=180), nullable=False),
        sa.Column('unit_price_snapshot', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('subtotal', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'payments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('provider', sa.String(length=40), nullable=False),
        sa.Column('provider_payment_id', sa.String(length=120), nullable=True),
        sa.Column('provider_preference_id', sa.String(length=120), nullable=True),
        sa.Column('status', sa.String(length=40), nullable=False),
        sa.Column('raw_payload_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade():
    op.drop_table('payments')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('product_images')

    op.drop_column('products', 'updated_at')
    op.drop_column('products', 'offer_price')
    op.drop_column('products', 'is_offer')
    op.drop_column('products', 'stock')
    op.drop_column('products', 'title')
