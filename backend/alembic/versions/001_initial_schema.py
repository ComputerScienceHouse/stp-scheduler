"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-04-30

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "time_blocks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.Integer(), nullable=False),
        sa.Column("end_time", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "instructors",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("max_sections", sa.Integer(), nullable=False),
        sa.Column("is_mentor", sa.Boolean(), nullable=False),
        sa.Column("subject_weights", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "students",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("subject_abilities", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "sections",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("subject", sa.String(), nullable=False),
        sa.Column("level", sa.Integer(), nullable=False),
        sa.Column("time_block_id", sa.Integer(), nullable=True),
        sa.Column("days", sa.String(), nullable=True),
        sa.Column("instructor_id", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["time_block_id"], ["time_blocks.id"]),
        sa.ForeignKeyConstraint(["instructor_id"], ["instructors.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "student_sections",
        sa.Column("student_id", sa.String(), nullable=False),
        sa.Column("section_id", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["section_id"], ["sections.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("student_id", "section_id"),
    )

    tb = sa.table(
        "time_blocks",
        sa.column("id", sa.Integer()),
        sa.column("start_time", sa.Integer()),
        sa.column("end_time", sa.Integer()),
    )
    op.bulk_insert(
        tb,
        [
            {"id": 0, "start_time": 800, "end_time": 900},
            {"id": 1, "start_time": 915, "end_time": 1015},
            {"id": 2, "start_time": 1045, "end_time": 1145},
            {"id": 3, "start_time": 1245, "end_time": 1345},
            {"id": 4, "start_time": 1400, "end_time": 1500},
            {"id": 5, "start_time": 1530, "end_time": 1630},
        ],
    )


def downgrade() -> None:
    op.drop_table("student_sections")
    op.drop_table("sections")
    op.drop_table("students")
    op.drop_table("instructors")
    op.drop_table("time_blocks")