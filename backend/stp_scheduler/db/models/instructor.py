from sqlalchemy import Boolean, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from stp_scheduler.db.base import Base


class InstructorRow(Base):
    __tablename__ = "instructors"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    max_sections: Mapped[int] = mapped_column(Integer, nullable=False, default=6)
    is_mentor: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    subject_weights: Mapped[dict] = mapped_column(JSONB, nullable=False)
