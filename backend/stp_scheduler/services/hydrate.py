"""Load domain objects from Postgres into in-memory API state."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from stp_scheduler.api import state
from stp_scheduler.db.models import (
    InstructorRow,
    SectionRow,
    StudentRow,
    student_section_table,
)
from stp_scheduler.domain.constants import TIME_BLOCKS
from stp_scheduler.domain.instructor import Instructor
from stp_scheduler.domain.section import Section
from stp_scheduler.domain.student import Student


def hydrate_from_database(db: Session) -> None:
    state.students.clear()
    state.instructors.clear()
    state.sections.clear()

    for row in db.scalars(select(StudentRow)).all():
        ab = row.subject_abilities
        s = Student(
            row.name,
            int(ab["english"]),
            int(ab["math"]),
            int(ab["asl"]),
            id=row.id,
        )
        state.students[str(s.id)] = s

    for row in db.scalars(select(InstructorRow)).all():
        inst = Instructor(
            dict(row.subject_weights),
            row.max_sections,
            row.name,
            row.is_mentor,
            id=row.id,
        )
        state.instructors[str(inst.id)] = inst

    _hydrate_sections(db)


def _hydrate_sections(db: Session) -> None:
    section_rows = db.scalars(select(SectionRow)).all()

    for row in section_rows:
        tb = (
            TIME_BLOCKS[row.time_block_id]
            if row.time_block_id is not None
            and 0 <= row.time_block_id < len(TIME_BLOCKS)
            else None
        )
        sec = Section(
            row.subject,
            row.level,
            time=tb,
            days=row.days,
            id=row.id,
        )
        state.sections[row.id] = sec

    for row in section_rows:
        sec = state.sections[row.id]
        if row.instructor_id:
            inst = state.instructors.get(row.instructor_id)
            if inst:
                inst.add_section(sec)
                sec.set_instructor(inst)

    pairs = db.execute(
        select(student_section_table.c.student_id, student_section_table.c.section_id)
    ).all()
    for student_id, section_id in pairs:
        student = state.students.get(student_id)
        section = state.sections.get(section_id)
        if student and section:
            section.add_student(student)
            student.add_section(section)
