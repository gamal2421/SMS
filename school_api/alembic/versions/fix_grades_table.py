"""fix grades table

Revision ID: fix_grades_table
Revises: add_missing_columns_to_grades
Create Date: 2024-03-19 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'fix_grades_table'
down_revision = 'add_missing_columns_to_grades'
branch_labels = None
depends_on = None

def upgrade():
    # Drop and recreate grades table with correct schema
    op.drop_table('grades')
    
    op.create_table('grades',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('class_id', sa.Integer(), nullable=False),
        sa.Column('assignment_id', sa.Integer(), nullable=True),
        sa.Column('submission_id', sa.Integer(), nullable=True),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('max_score', sa.Float(), server_default='100.0', nullable=False),
        sa.Column('grade_type', sa.String(), server_default='assignment', nullable=False),
        sa.Column('weight', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('rubric_data', sa.Text(), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), server_default='pending', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['assignment_id'], ['assignments.id'], ),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['submission_id'], ['assignment_submissions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_grades_id'), 'grades', ['id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_grades_id'), table_name='grades')
    op.drop_table('grades') 