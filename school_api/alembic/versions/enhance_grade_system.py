"""enhance grade system

Revision ID: enhance_grade_system
Revises: 957e83a3dfb4
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = 'enhance_grade_system'
down_revision = '957e83a3dfb4'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to grades table
    with op.batch_alter_table('grades') as batch_op:
        batch_op.add_column(sa.Column('max_score', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('grade_type', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('weight', sa.Float(), nullable=True, server_default='1.0'))
        batch_op.add_column(sa.Column('rubric_data', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('graded_date', sa.DateTime(), nullable=True))
        
        # Modify existing columns
        batch_op.alter_column('feedback',
                            existing_type=sa.String(),
                            type_=sa.Text(),
                            existing_nullable=True)
        batch_op.alter_column('status',
                            existing_type=sa.String(),
                            server_default='pending',
                            existing_nullable=True)

def downgrade():
    # Remove new columns from grades table
    with op.batch_alter_table('grades') as batch_op:
        batch_op.drop_column('max_score')
        batch_op.drop_column('grade_type')
        batch_op.drop_column('weight')
        batch_op.drop_column('rubric_data')
        batch_op.drop_column('graded_date')
        
        # Revert modified columns
        batch_op.alter_column('feedback',
                            existing_type=sa.Text(),
                            type_=sa.String(),
                            existing_nullable=True)
        batch_op.alter_column('status',
                            existing_type=sa.String(),
                            server_default=None,
                            existing_nullable=True) 