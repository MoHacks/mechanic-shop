"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0001'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'logs',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    op.create_table(
        'items',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('category', sa.String(), index=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('mode', sa.String(), nullable=True),
        sa.Column('new', sa.Integer(), nullable=True),
        sa.Column('used', sa.Integer(), nullable=True),
        sa.UniqueConstraint('name', 'category', name='uq_item_name_category'),
    )

    op.create_table(
        'threshold',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('category', sa.String(), nullable=False, unique=True),
        sa.Column('value', sa.Integer(), nullable=False),
    )

    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), unique=True, nullable=False),
        sa.Column('color_start', sa.String(), nullable=False),
        sa.Column('color_end', sa.String(), nullable=False),
    )

    op.execute("""
        INSERT INTO categories (name, color_start, color_end) VALUES
        ('tires',       'rgb(255,0,0)',    'rgb(0,255,0)'),
        ('oils',        'rgb(255,0,191)',  'rgb(255,255,0)'),
        ('oilfilters',  'rgb(136,0,255)',  'rgb(255,255,255)'),
        ('lightbulbs',  'rgb(255,0,195)',  'rgb(0,251,255)'),
        ('headlights',  'rgb(5,1,122)',    'rgb(255,249,127)'),
        ('brakelines',  'rgb(57,2,22)',    'rgb(255,169,137)')
    """)


def downgrade() -> None:
    op.drop_table('categories')
    op.drop_table('threshold')
    op.drop_table('items')
    op.drop_table('logs')
