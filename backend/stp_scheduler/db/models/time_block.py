from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column

from stp_scheduler.db.base import Base


class TimeBlockRow(Base):
    """Reference schedule blocks (seeded from constants, not from uploads).

    ``start_time`` / ``end_time`` are **HHMM** integers (no colon), same as
    ``TimeBlock.start`` / ``TimeBlock.end`` in the domain (e.g. 800 → 8:00, 1330 → 13:30).
    """

    __tablename__ = "time_blocks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    start_time: Mapped[int] = mapped_column(Integer, nullable=False)
    end_time: Mapped[int] = mapped_column(Integer, nullable=False)
