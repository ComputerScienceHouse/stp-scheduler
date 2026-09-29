import math

from stp_scheduler.domain.constants import (
    CORE_CLASSES,
    NON_CORE_CLASSES,
    get_level,
    is_core,
)
from stp_scheduler.domain.student import Student

# Level used for non-core buckets. Non-core classes are not placement tested, so
# they are not split into beginner/intermediate/advanced levels. We use a single
# sentinel level so a bucket still has a well defined identity.
NON_CORE_LEVEL = -1


class Bucket:
    def __init__(self, level: int, subject: str):
        self.level = level
        self.subject = subject
        self.students = []

    def is_core(self) -> bool:
        return is_core(self.subject)

    def add_student(self, student: Student) -> None:
        if student not in self.students:
            self.students.append(student)

    def assign_students(self, students: list[Student]) -> None:
        for student in students:
            if not self.is_core():
                # Non-core classes are not leveled: every student takes them.
                self.add_student(student)
                continue
            if get_level(student.get_subject_rankings()[self.subject]) == self.level:
                self.add_student(student)

    def get_sections_needed(self, class_limit: int = 7) -> int:
        return math.ceil(self.get_size() / class_limit)

    def get_size(self) -> int:
        return len(self.students)

    def get_students(self) -> list:
        return self.students

    def __hash__(self):
        return hash((self.level, self.subject))

    def __str__(self):
        if not self.is_core():
            return f"{self.subject.title()}"
        level_str = {0: "Beginning", 1: "Intermediate", 2: "Advanced"}.get(
            self.level, "Unknown"
        )
        return f"{level_str} {self.subject.capitalize()}"

    def __repr__(self):
        return self.__str__()


def create_buckets() -> tuple[list[Bucket], dict[str, Bucket]]:
    buckets = []

    # Core classes are placement tested and split into three levels.
    for subject in CORE_CLASSES:
        for level in (0, 1, 2):
            buckets.append(Bucket(level, subject))

    # Non-core classes are a single bucket that every student is placed into.
    for subject in NON_CORE_CLASSES:
        buckets.append(Bucket(NON_CORE_LEVEL, subject))

    buckets_dict = {str(bucket): bucket for bucket in buckets}
    return buckets, buckets_dict
