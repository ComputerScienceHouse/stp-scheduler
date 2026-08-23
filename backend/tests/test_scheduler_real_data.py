"""End-to-end test running the scheduler against the shipped sample CSV data."""

import os

from stp_scheduler.api import state
from stp_scheduler.domain.constants import ALL_CLASSES, days_overlap, is_core
from stp_scheduler.domain.instructor import Instructor
from stp_scheduler.domain.scheduler import run_scheduler
from stp_scheduler.domain.student import Student
from stp_scheduler.loaders.instructors_csv import parse_instructors_csv
from stp_scheduler.loaders.students_csv import parse_students_csv

_DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data"
)


def _load_real_data():
    with open(os.path.join(_DATA_DIR, "students.csv"), "rb") as f:
        for r in parse_students_csv(f.read()):
            s = Student(r.name, r.english, r.math, r.asl)
            state.students[str(s.id)] = s

    with open(os.path.join(_DATA_DIR, "instructors.csv"), "rb") as f:
        for r in parse_instructors_csv(f.read()):
            inst = Instructor(
                r.subject_weights, r.max_sections, r.name, r.is_mentor, id=r.id
            )
            state.instructors[str(inst.id)] = inst


def test_scheduler_runs_on_real_data_without_conflicts():
    _load_real_data()
    assert state.students
    assert state.instructors

    conflicts = run_scheduler()
    assert conflicts == []

    # All eight classes are scheduled.
    scheduled = {sec.get_subject() for sec in state.sections.values()}
    assert scheduled == set(ALL_CLASSES)

    # Day patterns are correct for every section.
    for sec in state.sections.values():
        if is_core(sec.get_subject()):
            assert sec.get_days() == "MTWRF"
        else:
            assert sec.get_days() in ("MWF", "TR")

    # Every student takes all eight classes with no time overlap.
    for student in state.students.values():
        assert len(student.get_schedule()) == 8
        sched = student.get_schedule()
        for i in range(len(sched)):
            for j in range(i + 1, len(sched)):
                a, b = sched[i], sched[j]
                assert not (
                    a.get_time() == b.get_time()
                    and days_overlap(a.get_days(), b.get_days())
                )
