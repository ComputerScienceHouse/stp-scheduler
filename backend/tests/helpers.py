"""Shared helpers for building scheduler state in tests."""

from stp_scheduler.api import state
from stp_scheduler.domain.constants import ALL_CLASSES
from stp_scheduler.domain.instructor import Instructor
from stp_scheduler.domain.student import Student


def add_student(name: str, english: int, math: int, asl: int) -> Student:
    s = Student(name, english, math, asl)
    state.students[str(s.id)] = s
    return s


def qualified_for_all(weight: int = 1) -> dict[str, int]:
    """A subject-weights dict qualifying an instructor for every class."""
    return {c: weight for c in ALL_CLASSES}


def add_instructor(
    name: str,
    subject_weights: dict[str, int] | None = None,
    max_sections: int = 6,
    is_mentor: bool = False,
) -> Instructor:
    weights = subject_weights if subject_weights is not None else qualified_for_all()
    inst = Instructor(weights, max_sections, name, is_mentor)
    state.instructors[str(inst.id)] = inst
    return inst
