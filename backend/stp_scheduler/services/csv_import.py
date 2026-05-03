"""Transactional replace-all import from uploaded CSV bytes."""

import uuid

from sqlalchemy import delete
from sqlalchemy.orm import Session

from stp_scheduler.db.models import (
    InstructorRow,
    SectionRow,
    StudentRow,
    student_section_table,
)
from stp_scheduler.loaders.instructors_csv import parse_instructors_csv
from stp_scheduler.loaders.students_csv import parse_students_csv


def _clear_schedule_tables(db: Session) -> None:
    db.execute(delete(student_section_table))
    db.execute(delete(SectionRow))


def import_students_replace_all(db: Session, content: bytes) -> int:
    rows = parse_students_csv(content)
    _clear_schedule_tables(db)
    db.execute(delete(StudentRow))
    for r in rows:
        sid = str(uuid.uuid4())
        db.add(
            StudentRow(
                id=sid,
                name=r.name,
                subject_abilities={
                    "english": r.english,
                    "math": r.math,
                    "asl": r.asl,
                },
            )
        )
    db.commit()
    return len(rows)


def import_instructors_replace_all(db: Session, content: bytes) -> int:
    rows = parse_instructors_csv(content)
    _clear_schedule_tables(db)
    db.execute(delete(InstructorRow))
    for r in rows:
        db.add(
            InstructorRow(
                id=r.id,
                name=r.name,
                max_sections=r.max_sections,
                is_mentor=r.is_mentor,
                subject_weights=r.subject_weights,
            )
        )
    db.commit()
    return len(rows)
