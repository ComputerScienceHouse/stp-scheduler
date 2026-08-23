"""Scheduling logic for the STP scheduler.

The scheduler produces a weekly schedule for **all eight classes**:

* Three *core* classes (``english``, ``math``, ``asl``) are placement tested, so
  students are split into beginner / intermediate / advanced buckets and these
  classes run five days a week (``MTWRF``).
* Five *non-core* classes are not placement tested; every student takes them and
  they only run on either ``MWF`` or ``TR``.

Because a core class occupies a whole time block (all five days) while two
non-core classes can share one block (one ``MWF`` + one ``TR``), the time-block
assignment is a graph-colouring problem. We solve it with a backtracking
DSATUR-style search over the section conflict graph.
"""

from stp_scheduler.api import state
from stp_scheduler.domain.bucket import create_buckets
from stp_scheduler.domain.constants import (
    CORE_DAYS,
    NON_CORE_DAY_OPTIONS,
    TIME_BLOCKS,
    days_overlap,
    is_core,
)
from stp_scheduler.domain.instructor import Instructor, generate_instructor_dataframe
from stp_scheduler.domain.section import Section
from stp_scheduler.domain.student import Student

# Guard rail so a pathological/infeasible input cannot make the search run
# forever. The realistic instances are tiny, so this ceiling is generous.
_MAX_BACKTRACK_NODES = 5_000_000


def build_student_conflict_graph(
    sections_list: list[Section],
    students_list: list[Student],
) -> dict[Section, set[Section]]:
    """Two sections conflict if a student is enrolled in both of them."""
    conflicts: dict[Section, set[Section]] = {s: set() for s in sections_list}

    for student in students_list:
        sched = student.get_schedule()
        for i in range(len(sched)):
            for j in range(i + 1, len(sched)):
                s1, s2 = sched[i], sched[j]
                conflicts[s1].add(s2)
                conflicts[s2].add(s1)

    return conflicts


def _slot_options(section: Section) -> list[str]:
    """The day patterns a section may run on."""
    return [CORE_DAYS] if is_core(section.get_subject()) else NON_CORE_DAY_OPTIONS


def _can_place(section: Section, conflicts, block, days: str) -> bool:
    """True if ``section`` can occupy ``block`` on ``days`` without colliding with
    an already-placed conflicting section (same block *and* overlapping days)."""
    for neighbor in conflicts[section]:
        n_time = neighbor.get_time()
        if n_time is None or n_time != block:
            continue
        if days_overlap(neighbor.get_days(), days):
            return False
    return True


def assign_time_blocks(
    sections_list: list[Section],
    students_list: list[Student],
) -> None:
    """Assign every section a time block and day pattern.

    Core classes take a whole block on ``MTWRF``; non-core classes take ``MWF``
    or ``TR`` and can therefore share a block. A plain greedy pass can dead-end,
    so we backtrack with a *minimum-remaining-values* heuristic (always colour
    the section with the fewest legal (block, days) options next) to reliably
    find a valid assignment quickly when one exists.
    """
    conflicts = build_student_conflict_graph(sections_list, students_list)

    for section in sections_list:
        section.set_time(None)
        section.set_days(None)

    # All legal (block, days) slots per section.
    all_slots = {
        section: [(b, d) for b in TIME_BLOCKS for d in _slot_options(section)]
        for section in sections_list
    }

    nodes = 0

    def legal_slots(section) -> list[tuple]:
        return [
            (b, d)
            for (b, d) in all_slots[section]
            if _can_place(section, conflicts, b, d)
        ]

    def backtrack(unassigned: list) -> bool:
        nonlocal nodes
        nodes += 1
        if nodes > _MAX_BACKTRACK_NODES:
            raise RuntimeError("Time-block assignment exceeded search budget")
        if not unassigned:
            return True

        # Minimum-remaining-values: pick the most constrained section next.
        options = {s: legal_slots(s) for s in unassigned}
        section = min(unassigned, key=lambda s: len(options[s]))
        if not options[section]:
            return False

        remaining = [s for s in unassigned if s is not section]
        for block, days in options[section]:
            section.set_time(block)
            section.set_days(days)
            if backtrack(remaining):
                return True
            section.set_time(None)
            section.set_days(None)
        return False

    if not backtrack(list(sections_list)):
        raise RuntimeError("Could not assign time blocks for all sections")


def _instructor_time_conflict(instructor: Instructor, section: Section) -> bool:
    """True if placing ``section`` would double-book ``instructor``."""
    for existing in instructor.schedule:
        if (
            existing.get_time() is not None
            and existing.get_time() == section.get_time()
            and days_overlap(existing.get_days(), section.get_days())
        ):
            return True
    return False


def assign_instructors(
    sections_list: list[Section],
    instructors_list: list[Instructor],
) -> None:
    """Assign a qualified instructor to each section, preferring instructors who
    listed the subject as a preference (weight ``1``) over merely qualified ones
    (weight ``0``), and balancing load. Instructors are never double-booked."""
    df = generate_instructor_dataframe(instructors_list)

    # Place the most constrained sections (largest blocks of the day) first is
    # not required here; any order works because time blocks are already fixed.
    for section in sections_list:
        subject = section.get_subject().capitalize()
        if subject not in df.columns:
            continue

        preferred = df[df[subject] == 1]
        fallback = df[df[subject] == 0]
        pool = preferred if not preferred.empty else fallback
        if pool.empty:
            continue

        pool = pool.copy()
        pool["assigned"] = pool["Name"].apply(
            lambda n: len(next(t for t in instructors_list if t.name == n).schedule)
        )
        pool = pool.sort_values("assigned")

        for _, row in pool.iterrows():
            instructor = next(t for t in instructors_list if t.name == row["Name"])
            if instructor.is_full():
                continue
            if _instructor_time_conflict(instructor, section):
                continue
            try:
                instructor.add_section(section)
                section.set_instructor(instructor)
                break
            except Exception:
                continue


def check_for_conflicts(
    students_list: list[Student],
    instructors_list: list[Instructor],
) -> list[str]:
    """Report any student or instructor that ends up double-booked (two sections
    sharing a time block *and* a day)."""
    issues: list[str] = []

    def _has_overlap(schedule) -> bool:
        for i in range(len(schedule)):
            for j in range(i + 1, len(schedule)):
                a, b = schedule[i], schedule[j]
                if (
                    a.get_time() is not None
                    and a.get_time() == b.get_time()
                    and days_overlap(a.get_days(), b.get_days())
                ):
                    return True
        return False

    for student in students_list:
        if _has_overlap(student.get_schedule()):
            issues.append(f"Student conflict: {student}")

    for instructor in instructors_list:
        if _has_overlap(instructor.schedule):
            issues.append(f"Instructor conflict: {instructor}")

    return issues


def _split_students_into_sections(bucket, needed: int) -> list[list[Student]]:
    students = bucket.get_students()
    if needed <= 0:
        return []
    per_section = len(students) // needed
    groups = []
    for i in range(needed):
        start = i * per_section
        end = start + per_section if i < needed - 1 else len(students)
        groups.append(students[start:end])
    return groups


def build_sections(students_list: list[Student]) -> None:
    """Create sections for every class (core + non-core) and enroll students."""
    buckets, _ = create_buckets()

    for bucket in buckets:
        bucket.assign_students(students_list)
        needed = bucket.get_sections_needed()

        for group in _split_students_into_sections(bucket, needed):
            section = Section(bucket.subject, bucket.level)
            for student in group:
                section.add_student(student)
                student.add_section(section)
            state.sections[str(section.get_id())] = section


def run_scheduler() -> list[str]:
    state.sections.clear()

    students_list = list(state.students.values())
    instructors_list = list(state.instructors.values())

    for s in students_list:
        s.schedule.clear()
    for inst in instructors_list:
        inst.schedule.clear()

    build_sections(students_list)

    sections = list(state.sections.values())

    # Assign time blocks first (driven purely by student enrollment), then fit
    # instructors around the fixed grid so no one is ever double-booked.
    assign_time_blocks(sections, students_list)
    assign_instructors(sections, instructors_list)

    return check_for_conflicts(students_list, instructors_list)
