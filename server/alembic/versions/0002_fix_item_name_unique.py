"""fix item name unique constraint to be per-category

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-27 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0002'
down_revision: Union[str, Sequence[str], None] = '0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('items') as batch_op:
        batch_op.create_unique_constraint('uq_item_name_category', ['name', 'category'])


def downgrade() -> None:
    with op.batch_alter_table('items') as batch_op:
        batch_op.drop_constraint('uq_item_name_category', type_='unique')
