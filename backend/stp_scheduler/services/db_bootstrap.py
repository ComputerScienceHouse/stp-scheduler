"""Reference data (time_blocks) — not from CSV uploads."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from stp_scheduler.db.models import TimeBlockRow
from stp_scheduler.domain.constants import TIME_BLOCKS


def ensure_time_blocks(db: Session) -> None:
    existing = db.scalars(select(TimeBlockRow.id)).all()
    if len(existing) >= len(TIME_BLOCKS):
        return
    for i, tb in enumerate(TIME_BLOCKS):
        row = db.get(TimeBlockRow, i)
        if row is None:
            db.add(
                TimeBlockRow(
                    id=i,
                    start_time=tb.start,
                    end_time=tb.end,
                )
            )
    db.commit()
