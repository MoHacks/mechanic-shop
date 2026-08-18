"""create categories table

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-08-18 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), primary_key=True),
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
