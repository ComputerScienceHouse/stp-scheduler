import uuid
from typing import TYPE_CHECKING

import pandas as pd

if TYPE_CHECKING:
    from stp_scheduler.domain.section import Section


class Instructor:
    def __init__(
        self,
        subjects_rankings: dict,
        sections: int,
        name: str,
        is_mentor: bool = False,
        id: uuid.UUID | str | None = None,
    ):
        self.id = uuid.UUID(str(id)) if id is not None else uuid.uuid4()
        self.name = name
        self.subjects = subjects_rankings
        self.sections = int(sections)
        self.is_mentor = is_mentor
        self.schedule: list["Section"] = []

    def is_full(self):
        return len(self.schedule) == self.sections

    def get_schedule(self) -> list["Section"]:
        return self.schedule

    def add_section(self, section: "Section"):
        if self.is_full():
            raise IndexError("Instructor's schedule is full.")
        elif self.subjects[section.get_subject().lower()] == -1:
            raise ValueError(
                f"Instructor {self.name} is not qualified to teach {section.get_subject()}."
            )
        else:
            self.schedule.append(section)

    def remove_section(self, section: "Section"):
        if section in self.schedule:
            section.remove_instructor()
            self.schedule.remove(section)

    def set_name(self, name):
        self.name = name

    def set_subjects(self, subject_rankings):
        self.subjects = subject_rankings

    def set_sections(self, sections):
        self.sections = sections

    def set_mentor(self, is_mentor):
        self.is_mentor = is_mentor

    def __str__(self):
        return f"{self.name}: {self.sections} sections{' (Mentor)' if self.is_mentor else ''}"

    def __repr__(self):
        return self.__str__()

    def __hash__(self):
        return hash((self.name, self.sections, self.is_mentor))

    def __eq__(self, other):
        if isinstance(other, Instructor):
            return (
                self.name == other.name
                and self.sections == other.sections
                and self.is_mentor == other.is_mentor
            )
        return False

    def to_json(self) -> dict:
        return {
            "id": str(self.id),
            "name": self.name,
            "subjects": self.subjects,
            "sectionIds": [str(section.get_id()) for section in self.schedule],
            "is_mentor": self.is_mentor,
        }


def generate_instructor_dataframe(instructors: list[Instructor]) -> pd.DataFrame:
    data = []
    for inst in instructors:
        row = {"Name": inst.name}
        for subject, ranking in inst.subjects.items():
            row[subject.capitalize()] = ranking
        data.append(row)
    return pd.DataFrame(data)


def delete_instructor(instructor: Instructor):
    for section in instructor.get_schedule():
        instructor.remove_section(section)
