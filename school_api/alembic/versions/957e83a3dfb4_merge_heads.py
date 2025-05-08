"""Merge heads

Revision ID: 957e83a3dfb4
Revises: bc29e7c6e6ca, create_initial_tables
Create Date: 2025-05-03 22:10:24.379146

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '957e83a3dfb4'
down_revision: Union[str, None] = ('bc29e7c6e6ca', 'create_initial_tables')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
