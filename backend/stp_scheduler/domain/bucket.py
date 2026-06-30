import math

from stp_scheduler.domain.constants import get_level, CORE_CLASSES, NON_CORE_CLASSES
from stp_scheduler.domain.student import Student


class Bucket:
    def __init__(self, level: int, subject: str):
        self.level = level
        self.subject = subject
        self.students = []

    def add_student(self, student: Student) -> None:
        if student not in self.students:
            self.students.append(student)

    def assign_students(self, students: list[Student]) -> None:
        if self.subject in CORE_CLASSES:
            for student in students:
                if get_level(student.get_subject_rankings()[self.subject]) == self.level:
                    self.add_student(student)
        else:
            for student in students:
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
        level_str = {0: "Beginning", 1: "Intermediate", 2: "Advanced"}.get(
            self.level, "Unknown"
        )
        return f"{level_str} {self.subject.capitalize()}"

    def __repr__(self):
        return self.__str__()


def create_buckets() -> tuple[list[Bucket], dict[str, Bucket]]:
    # TODO: Make this dynamic based on the subjects in the database
    levels = [0, 1, 2]
    # Create buckets for core subjects
    buckets = []
    for subject in CORE_CLASSES:
        for level in levels:
            buckets.append(Bucket(level, subject))
    # Create buckets for non-core subjects
    for subject in NON_CORE_CLASSES:
        buckets.append(Bucket(0, subject))
    buckets_dict = {str(bucket): bucket for bucket in buckets}
    return buckets, buckets_dict

if __name__ == "__main__":
    buckets, buckets_dict = create_buckets()
    print(buckets)
    print(buckets_dict)
