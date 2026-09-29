"""initial schema

Revision ID: 002
Revises:
Create Date: 2026-05-06

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the old FK constraint
    op.drop_constraint(
        "sections_instructor_id_fkey",
        "sections",
        type_="foreignkey"
    )

    # Create the new FK with CASCADE
    op.create_foreign_key(
        None,                     # Let Alembic generate a name
        "sections",               # Source table
        "instructors",            # Referenced table
        ["instructor_id"],        # Local column
        ["id"],                   # Remote column
        ondelete="CASCADE"
    )


def downgrade() -> None:
    # Reverse the change: drop CASCADE FK
    op.drop_constraint(
        None,
        "sections",
        type_="foreignkey"
    )

    # Restore original FK without CASCADE
    op.create_foreign_key(
        "sections_instructor_id_fkey",
        "sections",
        "instructors",
        ["instructor_id"],
        ["id"]
    )