"""add audit logs

Revision ID: 20260305_0004
Revises: 20260303_0003
Create Date: 2026-03-05 16:40:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = '20260305_0004'
down_revision = '20260303_0003'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('actor_user_id', sa.Integer(), nullable=True),
        sa.Column('actor_email', sa.String(length=255), nullable=True),
        sa.Column('actor_role', sa.String(length=20), nullable=True),
        sa.Column('entity_type', sa.String(length=60), nullable=False),
        sa.Column('entity_id', sa.String(length=120), nullable=False),
        sa.Column('action', sa.String(length=120), nullable=False),
        sa.Column('before_json', sa.JSON(), nullable=True),
        sa.Column('after_json', sa.JSON(), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['actor_user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_audit_logs_entity_type', 'audit_logs', ['entity_type'])
    op.create_index('ix_audit_logs_created_at', 'audit_logs', ['created_at'])


def downgrade():
    op.drop_index('ix_audit_logs_created_at', table_name='audit_logs')
    op.drop_index('ix_audit_logs_entity_type', table_name='audit_logs')
    op.drop_table('audit_logs')
