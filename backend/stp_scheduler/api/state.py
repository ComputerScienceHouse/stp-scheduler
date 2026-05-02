from stp_scheduler.domain.instructor import Instructor
from stp_scheduler.domain.section import Section
from stp_scheduler.domain.student import Student

students: dict[str, Student] = {}
instructors: dict[str, Instructor] = {}
sections: dict[str, Section] = {}
