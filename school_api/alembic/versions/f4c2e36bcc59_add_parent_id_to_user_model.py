"""Add parent_id to User model

Revision ID: f4c2e36bcc59
Revises: 
Create Date: 2025-05-02 18:05:04.717549

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision: str = 'f4c2e36bcc59'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Get the inspector
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    
    # Check if parent_id column exists
    columns = [col['name'] for col in inspector.get_columns('users')]
    if 'parent_id' not in columns:
        op.add_column('users', sa.Column('parent_id', sa.Integer(), nullable=True))
    
    # Check if foreign key exists
    fks = [fk['referred_table'] for fk in inspector.get_foreign_keys('users')]
    if 'users' not in fks:
        with op.batch_alter_table('users', schema=None) as batch_op:
            batch_op.create_foreign_key('fk_parent_id', 'users', ['parent_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_constraint('fk_parent_id', type_='foreignkey')
        batch_op.drop_column('parent_id')
