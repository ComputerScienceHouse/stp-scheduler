from typing import Optional

from pydantic import BaseModel


class InstructorRequest(BaseModel):
    id: Optional[str] = None
    name: str
    subject_weights: dict[str, int]
    sections: Optional[int] = None
    is_mentor: bool


class StudentRequest(BaseModel):
    id: Optional[str] = None
    name: str
    subject_abilities: dict[str, int]
    section_ids: Optional[list[str]] = None
