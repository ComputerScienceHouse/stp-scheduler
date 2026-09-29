"""Tests for the bucket generation and class/day constants."""

from stp_scheduler.domain.bucket import NON_CORE_LEVEL, create_buckets
from stp_scheduler.domain.constants import (
    ALL_CLASSES,
    CORE_CLASSES,
    NON_CORE_CLASSES,
    days_overlap,
    is_core,
)

from tests.helpers import add_student


def test_all_classes_is_core_plus_non_core():
    assert set(ALL_CLASSES) == set(CORE_CLASSES) | set(NON_CORE_CLASSES)
    assert len(ALL_CLASSES) == 8
    assert len(CORE_CLASSES) == 3
    assert len(NON_CORE_CLASSES) == 5


def test_is_core_classification():
    for c in CORE_CLASSES:
        assert is_core(c)
    for c in NON_CORE_CLASSES:
        assert not is_core(c)


def test_days_overlap():
    assert not days_overlap("MWF", "TR")
    assert days_overlap("MWF", "MWF")
    assert days_overlap("MTWRF", "MWF")
    assert days_overlap("MTWRF", "TR")
    # Unknown patterns are treated conservatively as overlapping.
    assert days_overlap(None, "MWF")


def test_create_buckets_covers_all_classes():
    buckets, _ = create_buckets()
    # 3 core * 3 levels + 5 non-core = 14 buckets.
    assert len(buckets) == 14

    core_subjects = {b.subject for b in buckets if b.is_core()}
    non_core_subjects = {b.subject for b in buckets if not b.is_core()}
    assert core_subjects == set(CORE_CLASSES)
    assert non_core_subjects == set(NON_CORE_CLASSES)


def test_non_core_buckets_take_every_student():
    students = [
        add_student("A", 1, 1, 1),
        add_student("B", 5, 5, 5),
        add_student("C", 9, 9, 9),
    ]
    buckets, _ = create_buckets()
    for b in buckets:
        b.assign_students(students)

    non_core = [b for b in buckets if not b.is_core()]
    for b in non_core:
        assert b.level == NON_CORE_LEVEL
        assert b.get_size() == len(students)


def test_core_buckets_split_students_by_level():
    students = [
        add_student("Low", english=1, math=1, asl=1),
        add_student("Mid", english=5, math=5, asl=5),
        add_student("High", english=9, math=9, asl=9),
    ]
    buckets, _ = create_buckets()
    for b in buckets:
        b.assign_students(students)

    core = [b for b in buckets if b.is_core()]
    # Each core subject should have exactly one student in each level bucket.
    for b in core:
        assert b.get_size() == 1
