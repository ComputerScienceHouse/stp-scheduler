from bucket import Bucket, create_buckets
from student import Student, load_student_csv
from section import Section, export_sections_to_csv
from teacher import Teacher, load_teachers_csv, generate_teacher_dataframe
import json
from constants import * 

def build_conflict_graph(sections: list[Section],
                         students: list[Student],
                         teachers: list[Teacher]) -> dict[Section, set[Section]]:
    """
    Build an undirected conflict graph: edges between sections that
    cannot share the same time block (because of student/teacher).
    """
    conflicts: dict[Section, set[Section]] = {s: set() for s in sections}

    # Student-based conflicts
    for student in students:
        sched = student.get_schedule()     # list[Section] :contentReference[oaicite:4]{index=4}
        for i in range(len(sched)):
            for j in range(i + 1, len(sched)):
                s1, s2 = sched[i], sched[j]
                conflicts[s1].add(s2)
                conflicts[s2].add(s1)

    # Teacher-based conflicts
    for teacher in teachers:
        tsched = teacher.schedule          # list[Section] :contentReference[oaicite:5]{index=5}
        for i in range(len(tsched)):
            for j in range(i + 1, len(tsched)):
                s1, s2 = tsched[i], tsched[j]
                conflicts[s1].add(s2)
                conflicts[s2].add(s1)

    return conflicts

def assign_time_blocks(sections: list[Section],
                       students: list[Student],
                       teachers: list[Teacher]) -> None:
    conflicts = build_conflict_graph(sections, students, teachers)

    # Order sections by descending degree (more conflicts first)
    ordered_sections = sorted(sections,
                              key=lambda s: len(conflicts[s]),
                              reverse=True)

    for section in ordered_sections:
        # Which time blocks are already used by conflicting neighbours?
        used_blocks = {
            neighbor.get_time()
            for neighbor in conflicts[section]
            if neighbor.get_time() is not None
        }

        # Pick the first available block
        for block in TIME_BLOCKS:          # BLOCK_ONE..SIX :contentReference[oaicite:7]{index=7}
            if block not in used_blocks:
                section.set_time(block)    # sets a TimeBlock on Section :contentReference[oaicite:8]{index=8}
                break
        else:
            # No block worked; you either need more blocks or a more advanced search
            raise RuntimeError(f"Could not assign time to {section}")

def check_for_conflicts(students: list[Student], teachers: list[Teacher]) -> None:
    # Student conflicts
    for student in students:
        seen = {}
        for sec in student.get_schedule():
            t = sec.get_time()
            if t is None:
                continue
            if t in seen:
                print(f"[STUDENT CONFLICT] {student} has {seen[t]} and {sec} at {t}")
            else:
                seen[t] = sec

    # Teacher conflicts
    for teacher in teachers:
        seen = {}
        for sec in teacher.schedule:
            t = sec.get_time()
            if t is None:
                continue
            if t in seen:
                print(f"[TEACHER CONFLICT] {teacher} has {seen[t]} and {sec} at {t}")
            else:
                seen[t] = sec

def main():
    # Read students csv and create Student objects
    students = load_student_csv("data/students.csv")
    print(f"Loaded {len(students)} students.")
    
    # Read teachers csv and create Teacher objects
    teachers = load_teachers_csv("teachers.csv")
    print(f"Loaded {len(teachers)} teachers.")
    
    # Create Buckets
    buckets, buckets_dict = create_buckets()
    
    # Assign students to Buckets
    sections = []
    for bucket in buckets:
        bucket.assign_students(students)  
        print(bucket, bucket.get_size(), "students,", bucket.get_sections_needed(), "sections needed")
        # Create Sections for each Bucket
        sections_needed = bucket.get_sections_needed()
        for i in range(sections_needed):
            section = Section(bucket.subject, bucket.level)
            print("  Created section:", section)
            # Add an equal amount of students to each section
            students_per_section = len(bucket.get_students()) // sections_needed
            start_idx = i * students_per_section
            end_idx = start_idx + students_per_section if i < sections_needed - 1 else len(bucket.get_students())
            assigned_students: list[Student] = bucket.get_students()[start_idx:end_idx]
            for student in assigned_students:
                section.add_student(student)
                student.add_section(section)
            sections.append(section)
    ### At this point, all Math, English, and ASL sections have been created and all students assigned ###
    print(f"Created a total of {len(sections)} sections.")
    print(sections)
    for student in students:
        print(f"{student} is enrolled in {len(student.get_schedule())} sections.")
    
    for section in sections:
        print(f"{section} has {len(section.get_students())} students.")
        
    # Assign teachers to sections
    # This method improves upon the brute force method by considering teacher qualifications and current workloads.
    # This version also prioritizes teachers with a score of 1 over those with a score of 0.
    teachers_df = generate_teacher_dataframe(teachers)
    for section in sections:
        subject = section.get_subject().capitalize()
        qualified_teachers = teachers_df[teachers_df[subject] == 1].copy()
        slightly_less_qualified = teachers_df[teachers_df[subject] == 0].copy()
        if qualified_teachers.empty:
            qualified_teachers = slightly_less_qualified
        if qualified_teachers.empty:
            print(f"No qualified teachers found for {section}.")
            continue
        # Sort by teacher with least sections assigned
        qualified_teachers['assigned_sections'] = qualified_teachers['Name'].apply(lambda name: len(next(t for t in teachers if t.name == name).schedule))
        qualified_teachers = qualified_teachers.sort_values(by='assigned_sections')
        assigned = False
        for _, row in qualified_teachers.iterrows():
            teacher = next(t for t in teachers if t.name == row['Name'])
            try:
                teacher.add_section(section)
                section.set_teacher(teacher)
                assigned = True
                print(f"Assigned {teacher} to {section}.")
                break
            except (IndexError, ValueError) as e:
                continue
        if not assigned:
            print(f"Could not assign a teacher to {section}.")
    
    # Now the hardest part: assigning time blocks to sections without conflicts.
    # This is a complex scheduling problem and may require advanced algorithms to solve optimally.
    # Here, we implement a simple greedy algorithm to assign time blocks via graph coloring.
    assign_time_blocks(sections, students, teachers)
    
    # Check for conflicts
    check_for_conflicts(students, teachers)
    
    print("Final Section Assignments:")
    for section in sections:
        print(f"{section} taught by {section.get_teacher()} with {len(section.get_students())} students.")
    
    print("Final Teacher Schedules:")
    for teacher in teachers:
        print(f"{teacher} is teaching {len(teacher.schedule)} sections:")
        for sec in teacher.schedule:
            print(f"  - {sec} at {sec.get_time()}")
    
    print("Final Student Schedules:")
    for student in students:
        print(f"{student} is enrolled in {len(student.get_schedule())} sections:")
        for sec in student.get_schedule():
            print(f"  - {sec} at {sec.get_time()}")
    
    # Export the final schedules to JSON files
    sections_json = [section.to_json() for section in sections]
    teachers_json = [teacher.to_json() for teacher in teachers]
    students_json = [student.to_json() for student in students]

    with open("sections.json", "w") as f:
        json.dump(sections_json, f, indent=2)

    with open("teachers.json", "w") as f:
        json.dump(teachers_json, f, indent=2)

    with open("students.json", "w") as f:
        json.dump(students_json, f, indent=2)
    
    export_sections_to_csv(sections, "final_sections.csv")

if __name__ == "__main__":
    main()