"""Scratch file for testing and experimentation."""

def brute_force_teachers():
    # This method is really bad and just gives each section the first available teacher who can teach it.
    # It does not consider teacher preferences or optimal assignments. Which leads to super unbalanced workloads.
    sections = [...]  # Assume sections have been created as per main.py
    teachers = [...]  # Assume teachers have been loaded as per main.py
    for section in sections:
        # This is super brute force and does not take into account teacher preferences or optimal assignments.
        assigned = False
        for teacher in teachers:
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
    
    print("Final Section Assignments:")
    for section in sections:
        print(f"{section} taught by {section.get_teacher()} with {len(section.get_students())} students.")
        
def dataframe_no_preference():
    # Assign teachers to sections
    # This method improves upon the brute force method by considering teacher qualifications and current workloads.
    # However, we should change it to prioritize teachers with a score of 1 over those with a score of 0.
    sections = [...]  # Assume sections have been created as per main.py
    teachers = [...]  # Assume teachers have been loaded as per main.py
    teachers_df = [...]  # Assume dataframe has been generated as per main.py
    for section in sections:
        subject = section.get_subject().capitalize()
        qualified_teachers = teachers_df[teachers_df[subject] != -1].copy()
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
            
scheduling_problem_description = """
Given:
A small fixed set of time slots: TIME_BLOCKS = [BLOCK_ONE, ..., BLOCK_SIX] constants
Each Section has:
- a subject + level
- a teacher
- a list of students
- a TimeBlock | None field you want to fill in via set_time() 

Each Student stores the list of Sections they’re enrolled in (schedule). 

Each Teacher stores the list of Sections in their schedule. 

The constraints:

- No student conflict: for any student, no two of their sections may share the same TimeBlock.
- No teacher conflict: for any teacher, no two of their sections may share the same TimeBlock.
- Optional: you can add more (e.g., “teacher prefers early blocks”), but those two are the main ones.

This can be turned into a conflict graph:
- Each node = one Section.
- Put an edge between two sections if:
- They share at least one student, or
- They have the same teacher.
- Then you need to assign each node a color (time block) from TIME_BLOCKS such that adjacent nodes have different colors → this is exactly graph coloring.

Interval scheduling would be appropriate if times were fixed intervals and you were choosing a subset (max number of non-overlapping classes). Here you’re assigning slots to all sections, so coloring is the more natural model.
"""