import uuid
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from stp_scheduler.domain.section import Section


class Student:
    def __init__(
        self,
        name: str,
        english: int,
        math: int,
        asl: int,
        id: uuid.UUID | str | None = None,
    ):
        self.id = uuid.UUID(str(id)) if id is not None else uuid.uuid4()
        self.name = name
        self.subject_rankings = {"math": math, "english": english, "asl": asl}
        self.schedule: list["Section"] = []

    def is_full(self) -> bool:
        return len(self.schedule) >= 6

    def get_subject_rankings(self) -> dict:
        return self.subject_rankings

    def set_subject_rankings(self, english, math, asl):
        self.subject_rankings = {"math": math, "english": english, "asl": asl}

    def set_name(self, name):
        self.name = name

    def set_schedule(self, schedule):
        self.schedule = schedule

    def get_english_level(self) -> int:
        return (
            0
            if self.subject_rankings["english"] <= 3
            else 2
            if self.subject_rankings["english"] > 6
            else 1
        )

    def get_math_level(self) -> int:
        return (
            0
            if self.subject_rankings["math"] <= 3
            else 2
            if self.subject_rankings["math"] > 6
            else 1
        )

    def get_asl_level(self) -> int:
        return (
            0
            if self.subject_rankings["asl"] <= 3
            else 2
            if self.subject_rankings["asl"] > 6
            else 1
        )

    def add_section(self, course: "Section"):
        if course not in self.schedule:
            self.schedule.append(course)

    def remove_section(self, course: "Section"):
        if course in self.schedule:
            self.schedule.remove(course)

    def get_schedule(self) -> list["Section"]:
        return self.schedule

    def __str__(self):
        return f"{self.name}"

    def __hash__(self):
        r = self.subject_rankings
        return hash((self.name, r["english"], r["math"], r["asl"]))

    def __eq__(self, other):
        if isinstance(other, Student):
            r, o = self.subject_rankings, other.subject_rankings
            return (
                self.name == other.name
                and r["english"] == o["english"]
                and r["math"] == o["math"]
                and r["asl"] == o["asl"]
            )
        return False

    def __repr__(self):
        return self.__str__()

    def to_json(self) -> dict:
        return {
            "id": str(self.id),
            "name": self.name,
            "subject_rankings": self.subject_rankings,
            "sectionIds": [str(section.get_id()) for section in self.schedule],
        }


def delete_student(student: Student):
    for section in student.get_schedule():
        section.remove_student(student)
