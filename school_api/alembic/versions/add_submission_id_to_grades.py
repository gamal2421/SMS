"""add submission_id to grades

Revision ID: add_submission_id_to_grades
Revises: enhance_grade_system
Create Date: 2024-03-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_submission_id_to_grades'
down_revision = 'enhance_grade_system'
branch_labels = None
depends_on = None

def upgrade():
    # Add submission_id column to grades table
    with op.batch_alter_table('grades') as batch_op:
        batch_op.add_column(sa.Column('submission_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('status', sa.String(), nullable=True, server_default='pending'))
        batch_op.create_foreign_key('fk_grades_submission_id', 'assignment_submissions', ['submission_id'], ['id'])

def downgrade():
    # Remove submission_id column from grades table
    with op.batch_alter_table('grades') as batch_op:
        batch_op.drop_constraint('fk_grades_submission_id', type_='foreignkey')
        batch_op.drop_column('submission_id')
        batch_op.drop_column('status') 