"""Fix is_deleted nullability and defaults

Revision ID: c4f920ae6c36
Revises: cecefadbbca6
Create Date: 2026-02-18 18:49:18.839270

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4f920ae6c36'
down_revision: Union[str, Sequence[str], None] = 'cecefadbbca6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Update existing NULL values to False
    op.execute("UPDATE cliente SET is_deleted = false WHERE is_deleted IS NULL")
    
    # 2. Add server default and set to NOT NULL
    op.alter_column('cliente', 'is_deleted',
               existing_type=sa.Boolean(),
               nullable=False,
               server_default=sa.text('false'))


def downgrade() -> None:
    op.alter_column('cliente', 'is_deleted',
               existing_type=sa.Boolean(),
               nullable=True,
               server_default=None)
