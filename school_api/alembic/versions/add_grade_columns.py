"""add grade columns

Revision ID: update_grades_table
Revises: 
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'update_grades_table'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to grades table
    with op.batch_alter_table('grades') as batch_op:
        batch_op.add_column(sa.Column('max_score', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('grade_type', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('weight', sa.Float(), nullable=True, server_default='1.0'))
        batch_op.add_column(sa.Column('rubric_data', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('status', sa.String(), nullable=True, server_default='pending'))
        batch_op.add_column(sa.Column('submission_date', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('graded_date', sa.DateTime(), nullable=True))

def downgrade():
    # Remove the new columns
    with op.batch_alter_table('grades') as batch_op:
        batch_op.drop_column('max_score')
        batch_op.drop_column('grade_type')
        batch_op.drop_column('weight')
        batch_op.drop_column('rubric_data')
        batch_op.drop_column('status')
        batch_op.drop_column('submission_date')
        batch_op.drop_column('graded_date') 