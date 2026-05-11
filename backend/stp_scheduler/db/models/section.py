from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from stp_scheduler.db.base import Base


class SectionRow(Base):
    __tablename__ = "sections"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    subject: Mapped[str] = mapped_column(String, nullable=False)
    level: Mapped[int] = mapped_column(Integer, nullable=False)
    time_block_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("time_blocks.id"), nullable=True
    )
    days: Mapped[str | None] = mapped_column(String, nullable=True)
    instructor_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("instructors.id", ondelete="SET NULL"), nullable=True
    )
