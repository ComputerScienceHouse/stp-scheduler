"""Persist in-memory sections graph to Postgres (replace-all)."""

from sqlalchemy import delete, insert
from sqlalchemy.orm import Session

from stp_scheduler.api import state
from stp_scheduler.db.models import SectionRow, student_section_table
from stp_scheduler.domain.constants import TIME_BLOCKS


def persist_schedule(db: Session) -> None:
    """Replace ``sections`` and ``student_sections`` from ``state.sections``. Caller commits."""
    db.execute(delete(student_section_table))
    db.execute(delete(SectionRow))

    for section in state.sections.values():
        tb = section.get_time()
        tb_id = TIME_BLOCKS.index(tb) if tb is not None else None
        inst = section.get_instructor()
        db.add(
            SectionRow(
                id=str(section.get_id()),
                subject=section.get_subject(),
                level=section.get_level(),
                time_block_id=tb_id,
                days=section.get_days(),
                instructor_id=str(inst.id) if inst else None,
            )
        )

    db.flush()

    for section in state.sections.values():
        sid = str(section.get_id())
        for student in section.get_students():
            db.execute(
                insert(student_section_table).values(
                    student_id=str(student.id),
                    section_id=sid,
                )
            )
