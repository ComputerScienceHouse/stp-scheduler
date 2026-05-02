from sqlalchemy import Column, ForeignKey, String, Table

from stp_scheduler.db.base import Base

student_section_table = Table(
    "student_sections",
    Base.metadata,
    Column("student_id", String, ForeignKey("students.id"), primary_key=True),
    Column("section_id", String, ForeignKey("sections.id"), primary_key=True),
)
