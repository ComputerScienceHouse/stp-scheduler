from stp_scheduler.domain.bucket import create_buckets
from stp_scheduler.domain.constants import CORE_CLASSES, TIME_BLOCKS
from stp_scheduler.domain.instructor import Instructor, generate_instructor_dataframe
from stp_scheduler.domain.section import Section
from stp_scheduler.domain.student import Student
from stp_scheduler.api import state


def build_conflict_graph(
    sections_list: list[Section],
    students_list: list[Student],
    instructors_list: list[Instructor],
) -> dict[Section, set[Section]]:
    conflicts = {s: set() for s in sections_list}

    for student in students_list:
        sched = student.get_schedule()
        for i in range(len(sched)):
            for j in range(i + 1, len(sched)):
                s1, s2 = sched[i], sched[j]
                conflicts[s1].add(s2)
                conflicts[s2].add(s1)

    for instructor in instructors_list:
        sched = instructor.schedule
        for i in range(len(sched)):
            for j in range(i + 1, len(sched)):
                s1, s2 = sched[i], sched[j]
                conflicts[s1].add(s2)
                conflicts[s2].add(s1)

    return conflicts


def assign_time_blocks(
    sections_list: list[Section],
    students_list: list[Student],
    instructors_list: list[Instructor],
) -> None:
    conflicts = build_conflict_graph(sections_list, students_list, instructors_list)

    ordered = sorted(
        sections_list,
        key=lambda s: len(conflicts[s]),
        reverse=True,
    )

    for section in ordered:
        if section.get_subject().lower() not in CORE_CLASSES:
            continue
        used_blocks = {
            neighbor.get_time()
            for neighbor in conflicts[section]
            if neighbor.get_time() is not None
        }

        for block in TIME_BLOCKS:
            if block not in used_blocks:
                section.set_time(block)
                break
        else:
            raise RuntimeError(f"Could not assign time block to {section}")
        section.set_days("MTWRF")


def check_for_conflicts(
    students_list: list[Student],
    instructors_list: list[Instructor],
) -> list[str]:
    issues = []

    for student in students_list:
        seen = {}
        for sec in student.get_schedule():
            t = sec.get_time()
            if t in seen:
                issues.append(f"Student conflict: {student}")
            seen[t] = sec

    for instructor in instructors_list:
        seen = {}
        for sec in instructor.schedule:
            t = sec.get_time()
            if t in seen:
                issues.append(f"Instructor conflict: {instructor}")
            seen[t] = sec

    return issues


def run_scheduler() -> list[str]:
    state.sections.clear()

    students_list = list(state.students.values())
    instructors_list = list(state.instructors.values())

    for s in students_list:
        s.schedule.clear()
    for inst in instructors_list:
        inst.schedule.clear()

    buckets, _ = create_buckets()

    for bucket in buckets:
        bucket.assign_students(students_list)
        needed = bucket.get_sections_needed()

        for i in range(needed):
            section = Section(bucket.subject, bucket.level)

            per_section = len(bucket.get_students()) // needed
            start = i * per_section
            end = (
                start + per_section
                if i < needed - 1
                else len(bucket.get_students())
            )

            for student in bucket.get_students()[start:end]:
                section.add_student(student)
                student.add_section(section)

            state.sections[str(section.get_id())] = section

    df = generate_instructor_dataframe(instructors_list)

    for section in state.sections.values():
        subject = section.get_subject().capitalize()

        preferred = df[df[subject] == 1]
        fallback = df[df[subject] == 0]
        pool = preferred if not preferred.empty else fallback

        if pool.empty:
            continue

        pool = pool.copy()
        pool["assigned"] = pool["Name"].apply(
            lambda n: len(
                next(
                    t for t in instructors_list if t.name == n
                ).schedule
            )
        )
        pool = pool.sort_values("assigned")

        for _, row in pool.iterrows():
            instructor = next(t for t in instructors_list if t.name == row["Name"])
            try:
                instructor.add_section(section)
                section.set_instructor(instructor)
                break
            except Exception:
                continue

    assign_time_blocks(
        list(state.sections.values()), students_list, instructors_list
    )
    return check_for_conflicts(students_list, instructors_list)
