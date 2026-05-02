from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

import pandas as pd

from stp_scheduler.domain.constants import CLASS_LIMIT, TIME_BLOCKS
from stp_scheduler.domain.time_block import TimeBlock

if TYPE_CHECKING:
    from stp_scheduler.domain.instructor import Instructor


class Section:
    """
    Creates a section of a class that students will take.
    """

    def __init__(
        self,
        subject: str,
        level: int,
        time: TimeBlock | None = None,
        days: str | None = None,
        instructor: Instructor | None = None,
        id: uuid.UUID | str | None = None,
    ):
        self.__id = uuid.UUID(str(id)) if id is not None else uuid.uuid4()
        self.__subject = subject
        self.__time = time
        self.__level = level
        self.__instructor = instructor
        self.__days = days
        self.__students = []

    def is_full(self):
        if len(self.__students) == CLASS_LIMIT:
            return True
        return False

    def add_student(self, student):
        if self.is_full():
            return IndexError("Class is at capacity.")
        self.__students.append(student)

    def get_students(self) -> list:
        return self.__students

    def remove_student(self, student):
        if student in self.__students:
            self.__students.remove(student)
        else:
            return IndexError("Student not found in class.")

    def set_instructor(self, instructor: Instructor):
        if instructor.is_full():
            raise IndexError("Instructor's schedule is full.")
        elif instructor.subjects[self.__subject.lower()] == -1:
            raise ValueError(
                f"Instructor {instructor.name} is not qualified to teach {self.__subject}."
            )
        else:
            self.__instructor = instructor

    def remove_instructor(self):
        self.__instructor = None

    def set_time(self, time: TimeBlock):
        self.__time = time

    def get_days(self):
        return self.__days

    def set_days(self, days: str):
        self.__days = days

    def get_instructor(self):
        return self.__instructor

    def get_time(self):
        return self.__time

    def get_level(self):
        return self.__level

    def get_subject(self):
        return self.__subject

    def get_id(self):
        return self.__id

    def __str__(self):
        return f"Section({self.__subject}, {self.__time}, {self.__level}, {self.__instructor})"

    def __repr__(self):
        return self.__str__()

    def to_json(self) -> dict:
        return {
            "id": str(self.__id),
            "subject": self.__subject,
            "level": self.__level,
            "timeBlockId": TIME_BLOCKS.index(self.__time) if self.__time else None,
            "days": self.__days,
            "instructorId": str(self.__instructor.id) if self.__instructor else None,
            "studentIds": [str(student.id) for student in self.__students],
        }


def export_sections_to_csv(sections: list[Section], file_name: str) -> None:
    data = []
    for section in sections:
        data.append(
            {
                "Subject": section.get_subject(),
                "Level": section.get_level(),
                "Time": str(section.get_time()),
                "Days": section.get_days(),
                "Instructor": section.get_instructor().name
                if section.get_instructor()
                else "Unassigned",
                "Students": " | ".join([str(student) for student in section.get_students()]),
            }
        )
    df = pd.DataFrame(data)
    df.to_csv(file_name, index=False)
