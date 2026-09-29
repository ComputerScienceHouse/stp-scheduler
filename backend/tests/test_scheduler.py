"""Tests for the expanded scheduler covering all eight classes."""

import pytest

from stp_scheduler.api import state
from stp_scheduler.domain.constants import (
    ALL_CLASSES,
    CORE_CLASSES,
    NON_CORE_CLASSES,
    days_overlap,
    is_core,
)
from stp_scheduler.domain.scheduler import run_scheduler

from tests.helpers import add_instructor, add_student


def _make_students(n: int) -> None:
    # Spread scores across levels so core buckets get populated at every level.
    for i in range(n):
        add_student(
            f"Student {i}",
            english=(i % 9) + 1,
            math=((i + 3) % 9) + 1,
            asl=((i + 6) % 9) + 1,
        )


def _pairwise_overlap(schedule) -> bool:
    for i in range(len(schedule)):
        for j in range(i + 1, len(schedule)):
            a, b = schedule[i], schedule[j]
            if (
                a.get_time() is not None
                and a.get_time() == b.get_time()
                and days_overlap(a.get_days(), b.get_days())
            ):
                return True
    return False


def test_all_eight_classes_are_scheduled():
    _make_students(20)
    add_instructor("Teacher")
    run_scheduler()

    scheduled_subjects = {sec.get_subject() for sec in state.sections.values()}
    assert scheduled_subjects == set(ALL_CLASSES)
    assert len(scheduled_subjects) == 8


def test_every_student_takes_every_class():
    _make_students(20)
    add_instructor("Teacher")
    run_scheduler()

    for student in state.students.values():
        subjects = sorted(sec.get_subject() for sec in student.get_schedule())
        assert subjects == sorted(ALL_CLASSES)
        assert len(student.get_schedule()) == 8


def test_core_classes_run_five_days():
    _make_students(20)
    add_instructor("Teacher")
    run_scheduler()

    core_sections = [s for s in state.sections.values() if is_core(s.get_subject())]
    assert core_sections
    for sec in core_sections:
        assert sec.get_days() == "MTWRF"


def test_non_core_classes_run_mwf_or_tr():
    _make_students(20)
    add_instructor("Teacher")
    run_scheduler()

    non_core_sections = [
        s for s in state.sections.values() if not is_core(s.get_subject())
    ]
    assert non_core_sections
    for sec in non_core_sections:
        assert sec.get_days() in ("MWF", "TR")


def test_no_student_or_instructor_conflicts():
    _make_students(20)
    add_instructor("Teacher A")
    add_instructor("Teacher B")
    conflicts = run_scheduler()

    assert conflicts == []
    for student in state.students.values():
        assert not _pairwise_overlap(student.get_schedule())
    for instructor in state.instructors.values():
        assert not _pairwise_overlap(instructor.schedule)


def test_every_section_has_a_time_block():
    _make_students(15)
    add_instructor("Teacher")
    run_scheduler()

    for sec in state.sections.values():
        assert sec.get_time() is not None
        assert sec.get_days() is not None


def test_non_core_sections_can_share_a_block_via_days():
    # With one MWF and one TR section in the same block, sections are allowed to
    # share a time block. Verify at least one block is shared by two non-core
    # sections with disjoint day patterns.
    _make_students(20)
    add_instructor("Teacher")
    run_scheduler()

    by_block: dict = {}
    for sec in state.sections.values():
        if not is_core(sec.get_subject()):
            by_block.setdefault(sec.get_time(), []).append(sec.get_days())

    shared = any(
        "MWF" in days and "TR" in days for days in by_block.values()
    )
    assert shared


def test_instructor_never_double_booked():
    _make_students(20)
    add_instructor("Teacher A")
    add_instructor("Teacher B")
    run_scheduler()

    for instructor in state.instructors.values():
        for i, a in enumerate(instructor.schedule):
            for b in instructor.schedule[i + 1 :]:
                assert not (
                    a.get_time() == b.get_time()
                    and days_overlap(a.get_days(), b.get_days())
                )


def test_instructor_only_teaches_qualified_subjects():
    _make_students(20)
    # Instructor qualified only for math and asl.
    weights = {c: -1 for c in ALL_CLASSES}
    weights["math"] = 1
    weights["asl"] = 1
    add_instructor("Specialist", subject_weights=weights)
    run_scheduler()

    for sec in state.sections.values():
        inst = sec.get_instructor()
        if inst is not None:
            assert inst.subjects[sec.get_subject().lower()] != -1


def test_scheduler_is_repeatable_and_clears_state():
    _make_students(15)
    add_instructor("Teacher")

    run_scheduler()
    first_count = len(state.sections)

    run_scheduler()
    second_count = len(state.sections)

    assert first_count == second_count
    # No leftover sections from the previous run enlarge schedules.
    for student in state.students.values():
        assert len(student.get_schedule()) == 8


def test_empty_students_produces_no_sections():
    add_instructor("Teacher")
    conflicts = run_scheduler()
    assert conflicts == []
    assert len(state.sections) == 0
