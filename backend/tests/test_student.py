"""Tests for the updated student capacity logic."""

from stp_scheduler.domain.constants import ALL_CLASSES
from stp_scheduler.domain.section import Section
from stp_scheduler.domain.student import Student


def test_student_not_full_below_eight_classes():
    student = Student("A", 5, 5, 5)
    for i in range(len(ALL_CLASSES) - 1):
        student.add_section(Section("english", 0))
    assert not student.is_full()


def test_student_full_at_eight_classes():
    student = Student("A", 5, 5, 5)
    for subject in ALL_CLASSES:
        student.add_section(Section(subject, 0))
    assert student.is_full()
    assert len(student.get_schedule()) == len(ALL_CLASSES) == 8
