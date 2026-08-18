"""add category to threshold

Revision ID: a1b2c3d4e5f6
Revises: bc28c2dbb7bc
Create Date: 2026-08-18 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'bc28c2dbb7bc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Step 1: add category as nullable so existing rows aren't violated
    with op.batch_alter_table('threshold') as batch_op:
        batch_op.add_column(sa.Column('category', sa.String(), nullable=True))

    # Step 2: assign existing rows to 'tires'
    op.execute("UPDATE threshold SET category = 'tires' WHERE category IS NULL")

    # Step 3: recreate the table enforcing NOT NULL + UNIQUE on category
    # (batch_alter_table rebuilds the table under the hood, which SQLite requires)
    with op.batch_alter_table('threshold') as batch_op:
        batch_op.alter_column('category', nullable=False)
        batch_op.create_unique_constraint('uq_threshold_category', ['category'])


def downgrade() -> None:
    with op.batch_alter_table('threshold') as batch_op:
        batch_op.drop_constraint('uq_threshold_category', type_='unique')
        batch_op.drop_column('category')
