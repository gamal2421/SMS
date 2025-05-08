"""add missing columns to grades

Revision ID: add_missing_columns_to_grades
Revises: add_submission_id_to_grades
Create Date: 2024-03-19 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_missing_columns_to_grades'
down_revision = 'add_submission_id_to_grades'
branch_labels = None
depends_on = None

def upgrade():
    # Add missing columns to grades table
    with op.batch_alter_table('grades') as batch_op:
        # First check if columns exist before adding them
        conn = op.get_bind()
        inspector = sa.inspect(conn)
        columns = [col['name'] for col in inspector.get_columns('grades')]
        
        if 'submission_id' not in columns:
            batch_op.add_column(sa.Column('submission_id', sa.Integer(), nullable=True))
            batch_op.create_foreign_key('fk_grades_submission_id', 'assignment_submissions', ['submission_id'], ['id'])
        
        if 'status' not in columns:
            batch_op.add_column(sa.Column('status', sa.String(), nullable=True, server_default='pending'))
        
        if 'rubric_data' not in columns:
            batch_op.add_column(sa.Column('rubric_data', sa.Text(), nullable=True))

def downgrade():
    # Remove added columns from grades table
    with op.batch_alter_table('grades') as batch_op:
        batch_op.drop_constraint('fk_grades_submission_id', type_='foreignkey')
        batch_op.drop_column('submission_id')
        batch_op.drop_column('status')
        batch_op.drop_column('rubric_data') 