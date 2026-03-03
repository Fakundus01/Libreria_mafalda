"""auth users, print requests, transfer support

Revision ID: 20260303_0003
Revises: 20260303_0002
Create Date: 2026-03-03 01:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = '20260303_0003'
down_revision = '20260303_0002'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=160), nullable=False),
        sa.Column('phone', sa.String(length=40), nullable=True),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='CUSTOMER'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )

    op.add_column('orders', sa.Column('order_code', sa.String(length=30), nullable=True))
    op.add_column('orders', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_orders_user_id', 'orders', 'users', ['user_id'], ['id'])

    op.execute("UPDATE orders SET order_code = 'MF-2026-' || lpad(id::text, 6, '0') WHERE order_code IS NULL")
    op.alter_column('orders', 'order_code', nullable=False)
    op.create_unique_constraint('uq_orders_order_code', 'orders', ['order_code'])

    op.add_column('products', sa.Column('sku', sa.String(length=60), nullable=True))
    op.add_column('products', sa.Column('category', sa.String(length=120), nullable=True))
    op.add_column('products', sa.Column('tags', sa.String(length=500), nullable=True))
    op.create_unique_constraint('uq_products_sku', 'products', ['sku'])

    op.create_table(
        'print_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('print_code', sa.String(length=30), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('customer_name', sa.String(length=160), nullable=False),
        sa.Column('customer_email', sa.String(length=255), nullable=False),
        sa.Column('customer_phone', sa.String(length=40), nullable=True),
        sa.Column('files', sa.JSON(), nullable=True),
        sa.Column('specs', sa.JSON(), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('print_code'),
    )


def downgrade():
    op.drop_table('print_requests')
    op.drop_constraint('uq_products_sku', 'products', type_='unique')
    op.drop_column('products', 'tags')
    op.drop_column('products', 'category')
    op.drop_column('products', 'sku')

    op.drop_constraint('uq_orders_order_code', 'orders', type_='unique')
    op.drop_constraint('fk_orders_user_id', 'orders', type_='foreignkey')
    op.drop_column('orders', 'user_id')
    op.drop_column('orders', 'order_code')

    op.drop_table('users')
