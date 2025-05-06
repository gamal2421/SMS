"""Add class enrollments table

Revision ID: add_class_enrollments
Revises: f4c2e36bcc59
Create Date: 2024-03-19 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_class_enrollments'
down_revision: Union[str, None] = 'f4c2e36bcc59'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create class_enrollments table
    op.create_table('class_enrollments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('class_id', sa.Integer(), nullable=False),
        sa.Column('enrollment_date', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_class_enrollments_class_id'), 'class_enrollments', ['class_id'], unique=False)
    op.create_index(op.f('ix_class_enrollments_student_id'), 'class_enrollments', ['student_id'], unique=False)


def downgrade() -> None:
    # Drop class_enrollments table
    op.drop_index(op.f('ix_class_enrollments_student_id'), table_name='class_enrollments')
    op.drop_index(op.f('ix_class_enrollments_class_id'), table_name='class_enrollments')
    op.drop_table('class_enrollments') 