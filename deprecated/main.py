""" Priority Scheduler: 

1. Schedule each student by the lowest test score first 
2. If not, schedule in this order:
    - English
    - Math
    - ASL

A score of 0 means that no test score was received. In this instance, they will default to Beginner level.
"""
from typing import List, Tuple, Dict, Union
from collections import defaultdict
from student import Student
from buckets import Buckets
from teacher import Teacher
from section import Section
from constants import *
import math


def load_student_csv(file_name) -> List[Student]:
    """
    CSV Format: 
    Name, English, Math, ASL
    """
    with open(file_name, 'r') as file:
        data = file.readlines()
    data = [line.strip().split(',') for line in data]
    students = []
    
    for i, line in enumerate(data):
        if i == 0:
            continue
        if line[0] == '':
            line[0] = 'Unknown'
        if line[1] == '':
            line[1] = 0
        if line[2] == '':
            line[2] = 0
        if line[3] == '':
            line[3] = 0
        
        name = line[0]
        english = int(line[1])
        math = int(line[2])
        asl = int(line[3])
        students.append(Student(name, english, math, asl))
    
    return students

def return_scores(students: List[Student]) -> List[Tuple[int, int, int]]:
    """
    Returns a list of test scores for each student.
    """
    return [(student_to_score.english, student_to_score.math, student_to_score.asl) for student_to_score in students]

def make_buckets(students: List[Student]) -> Buckets:
    bucket = Buckets()
    bucket.sort_courses(students)
    return bucket
    
def sort_students(students_to_score: List[Student]) -> List[Student]:
    """
    Returns a list of student names in the order they should be scheduled.
    """
    sorted_students = sorted(students_to_score, key=(min(return_scores(students_to_score)), return_scores(students_to_score)))
    return sorted_students

def load_instructor_csv(file_name) -> List[Teacher]:
    """
    CSV Format:
    Course, Instructor, Section Count, Blank Space, Mentoring Info
    """
    with open(file_name, 'r') as file:
        data = file.readlines()
    data = [line.strip().split(',') for line in data]
    instructors = []
    mentors = []
    for i, line in enumerate(data):
        if i == 0:
            continue
        
        if line[4] != '':
            mentors.append(line[4])
        
        if line[0] == '':
            continue
        if line[1] == '':
            line[1] = 'TBD'
        if line[2] == '':
            line[2] = 1
        instructors.append(line[0: 3])
    
    teachers = []
    for instructor in instructors:
        if instructor[1] not in mentors:
            teachers.append(Teacher(*instructor))
        else:
            mentors.remove(instructor[1])
            teachers.append(Teacher(*instructor, is_mentor=True))
    if len(mentors) > 0:
        for mentor in mentors:
            teachers.append(Teacher('Mentoring', mentor, 0, is_mentor=True))
    return teachers

def create_sections_easy(class_count_dict: Dict) -> List[Section]:
    """
    Creates sections for each class assuming there is no issue with the number of students.
    """
    sections = []
    for class_name, count in class_count_dict.items():
        if count > 0:
            for i in range(count):
                level = 0
                if "beginning" in class_name:
                    level = BEGINNER
                elif "intermediate" in class_name:
                    level = INTERMEDIATE
                elif "advanced" in class_name:
                    level = ADVANCED

                days = None
                if "English" in class_name:
                    name = "Essential Communication"
                    days = "MWTRF"
                elif "Math" in class_name:
                    name = "Technical Math"
                    days = "MWTRF"
                elif "ASL" in class_name:
                    name = "ASL"
                    days = "MWTRF"

                sections.append(Section(name, None, days, CLASS_LIMIT, level, None))
    return sections

def create_sections_hard(class_count_dict: Dict, subject_availability_dict: Dict, subjects: Union[List, str]) -> Tuple[List[Section], Dict]:
    """
    Creates sections for each class assuming there is an issue with the number of students.
    This function will create sections based on the availability of subjects.
    If there are not enough sections available, it will prioritize lower level classes first, and then move higher classes to the overflow dictionary.
    
    IN FUTURE ITERATIONS, THIS SHOULD INSTEAD PRIORITIZE THE LARGER CLASS FIRST, THEN THE SMALLER CLASS.
   
    """
    sections = []
    overflow_dict = {}
    class_counts = class_count_dict.items()

    if isinstance(subjects, str):
        subjects = [subjects]

    # Loop through each class and add 1 sections until there are no more subjects available
    subject_availability_dict = {key: value for key, value in subject_availability_dict.items() if key in subjects}  # Filter to only include relevant subjects

    while any(subject_availability_dict.values()):  # Continue while there are available subjects
        # print("Subject availability dict: ", subject_availability_dict)
        for class_name, count in class_counts:
            # print("Class name: ", class_name, "Count: ", count)
            if count > 0:
                # Determine the level based on the class name
                level = 0
                if "beginning" in class_name:
                    level = BEGINNER
                elif "intermediate" in class_name:
                    level = INTERMEDIATE
                elif "advanced" in class_name:
                    level = ADVANCED

                name = class_name
                days = None
                if "English" in class_name or "Communication" in class_name:
                    name = "Essential Communication"
                    days = "MWTRF"
                elif "Math" in class_name:
                    name = "Technical Math"
                    days = "MWTRF"
                elif "ASL" in class_name:
                    name = "ASL"
                    days = "MWTRF"
                
                # Create a section and append it to the list
                sections.append(Section(name, None, days, CLASS_LIMIT, level, None))
                
                # Decrement the count in subject_availability_dict
                subject_availability_dict[name] -= 1
                # Decrement the count in class_count_dict
                class_count_dict[class_name] -= 1
                # If the count reaches zero, remove it from the dictionary
                if subject_availability_dict[name] <= 0:
                    del subject_availability_dict[name]
                    break
                
        # print(sections)
    
    # Add any remaining counts to overflow_dict
    for class_name, count in class_count_dict.items():
        if count > 0:
            # print("Adding to overflow dict: ", class_name, count)
            overflow_dict[class_name] = count
    
    return sections, overflow_dict

def assign_teachers_to_sections(sections: List[Section], instructors: List[Teacher]) -> None:
    """
    Assigns teachers to sections based on their availability and the subjects they teach.
    """
    for instructor in instructors:
        for section in sections:
            if section.get_subject() == instructor.subject and section.get_teacher() is None and not instructor.is_full():
                section.set_teacher(instructor)
                instructor.add_section(section)

### TODO: Change it so that students are assigned to sections based on level before times are decided.
def assign_times_to_sections(sections: List[Section], time_blocks: List[TimeBlock]) -> None:
    """
    Assign a time block to each section using the constant time blocks.

    - It is preferred that the same class at different levels is offered during the same time block.
    - Ensure that the same time block is not used more than once for each teacher.
    - Ensure that each teacher does not have more than two sections back to back.
    """
    # Group sections by class name
    class_groups = defaultdict(list)
    for section in sections:
        class_groups[section.get_subject()].append(section)

    # Track teacher availability and consecutive sections
    teacher_schedule = defaultdict(list)  # {teacher: [time_block1, time_block2, ...]}

    for class_name, class_sections in class_groups.items():
        time_block_index = 0

        for section in class_sections:
            teacher = section.get_teacher()
            if not teacher:
                continue  # Skip if no teacher is assigned

            # Find the next available time block for the teacher
            while time_block_index < len(time_blocks):
                time_block = time_blocks[time_block_index]

                # Check if the teacher already has this time block or too many consecutive sections
                if time_block not in teacher_schedule[teacher] and not has_consecutive_sections(teacher_schedule[teacher], time_block):
                    # Assign the time block to the section
                    section.set_time(time_block)

                    # Update the teacher's schedule
                    teacher_schedule[teacher].append(time_block)
                    teacher.add_time_block(time_block)
                    break

                time_block_index += 1

            # Reset time_block_index if we run out of time blocks
            if time_block_index >= len(time_blocks):
                time_block_index = 0


def has_consecutive_sections(schedule: List[str], new_time_block: str) -> bool:
    """
    Helper function to check if adding a new time block would result in more than two consecutive sections.
    """
    if not schedule:
        return False

    # Convert time blocks to indices for comparison
    time_block_indices = [TIME_BLOCKS.index(tb) for tb in schedule]
    new_time_block_index = TIME_BLOCKS.index(new_time_block)

    # Check for consecutive sections
    time_block_indices.append(new_time_block_index)
    time_block_indices.sort()

    consecutive_count = 1
    for i in range(1, len(time_block_indices)):
        if time_block_indices[i] == time_block_indices[i - 1] + 1:
            consecutive_count += 1
            if consecutive_count > 2:
                return True
        else:
            consecutive_count = 1

    return False

def assign_students_to_sections(students: List[Student], sections: List[Section]) -> List[Student]:
    """
    Assigns students to sections based on their scores and the sections available.

    - Students are assigned to sections for each subject (English, Math, ASL, etc.).
    - Ensures no conflicting times for a student across different subjects.
    - If a section is full, the student will not be assigned to that section.
    - If a student cannot be assigned to a section for a subject, they will be added to the overflow list.
    - A student must be assigned for each type of class (English, Math, ASL, etc.).
    - Each student has a score for each subject, english, math, asl.
    
    Returns overflow students.
    """
    overflow_students = []

    # Group sections by subject
    subject_sections = defaultdict(list)
    for section in sections:
        subject_sections[section.get_subject()].append(section)

    for student in students:
        assigned_subjects = set()
        for subject, subject_section_list in subject_sections.items():
            assigned = False

            # Check the student's score for the subject
            student_level = None
            if subject == "Essential Communication":
                student_level = student.get_english_level()
            elif subject == "Technical Math":
                student_level = student.get_math_level()
            elif subject == "ASL":
                student_level = student.get_asl_level()

            # Skip if the student has no score for the subject
            if student_level is None or student_level == 0:
                continue

            for section in subject_section_list:
                # Check if the section matches the student's level, has capacity, and does not conflict with existing times
                if (
                    section.get_level() == student_level
                    and section.get_capacity() > 0
                    and section.get_time() not in [s.get_time() for s in student.get_schedule()]
                ):
                    # Assign the student to the section
                    section.add_student(student)
                    student.add_section(section)
                    assigned = True
                    assigned_subjects.add(subject)
                    break

            if not assigned:
                # Add the student to the overflow list if no suitable section is found for this subject
                break

        # Add the student to overflow if they are not assigned to all three subjects
        if len(assigned_subjects) < 3:
            overflow_students.append(student)

    return overflow_students

def main():
    # Load the CSV files
    students = load_student_csv('data/students.csv')

    instructors = load_instructor_csv('data/instructors.csv')
    
    # Create buckets for each subject
    buckets = make_buckets(students)
    buckets.set_class_count()
    
    # Print the students and their buckets
    print(len(students), "students loaded.")
    print(buckets)
    
    # Print instructors and classes
    print(len(instructors), "instructors loaded.")
    subject_availability_dict = {}
    for instructor in instructors:
        print(instructor)
        subject_availability_dict[instructor.subject] = instructor.sections if not subject_availability_dict.get(instructor.subject) else subject_availability_dict[instructor.subject] + instructor.sections

    print(subject_availability_dict)

    class_count_dict = buckets.get_class_count()

    for class_name, count in class_count_dict.items():
        print(f"{class_name}: {count} sections needed")

    # Generate total counts of each class (both available and required)

    english_required_dict = {key: value for key, value in class_count_dict.items() if "English" in key}
    math_required_dict = {key: value for key, value in class_count_dict.items() if "Math" in key}
    asl_required_dict = {key: value for key, value in class_count_dict.items() if "ASL" in key}

    # Create section objects
    print("Creating sections...")
    if sum(english_required_dict.values()) <= subject_availability_dict.get("Essential Communication", 0):
        english_sections = create_sections_easy(english_required_dict)
        english_overflow = {}
    else:
        # print("Hard english")
        english_sections, english_overflow = create_sections_hard(english_required_dict, subject_availability_dict, "Essential Communication")
    if sum(math_required_dict.values()) <= subject_availability_dict.get("Technical Math", 0):
        math_sections = create_sections_easy(math_required_dict)
        math_overflow = {}
    else:
        # print("Hard math")
        math_sections, math_overflow = create_sections_hard(math_required_dict, subject_availability_dict, "Technical Math")
    if sum(asl_required_dict.values()) <= subject_availability_dict.get("ASL", 0):
        asl_sections = create_sections_easy(asl_required_dict)
        asl_overflow = {}
    else:
        # print("Hard asl")
        asl_sections, asl_overflow = create_sections_hard(asl_required_dict, subject_availability_dict, "ASL")
    
    # Combine all sections into one list
    all_sections = english_sections + math_sections + asl_sections
    all_overflow = {**english_overflow, **math_overflow, **asl_overflow}
    print(all_overflow)
    # Print the sections
    print("Sections created:")
    for section in all_sections:
        print(section)
    
    # Assign teachers to sections
    print("Assigning teachers to sections...")
    assign_teachers_to_sections(all_sections, instructors)
    
    # Assign times to sections
    print("Assigning times to sections...")
    assign_times_to_sections(all_sections, TIME_BLOCKS)

    # Print the sections with assigned teachers and times
    print("Sections with assigned teachers and times:")
    for section in all_sections:
        print(section)

    # Assign students to sections
    print("Assigning students to sections...")
    overflow_students = assign_students_to_sections(students, all_sections)
    # Print the assigned students
    print("Students assigned to sections:")
    for student in students:
        print(student)
        print(student.get_schedule())
    print("\nOverflow students:")
    for student in overflow_students:
        print(student)

    # Write student schedules to CSV
    with open('data/student_schedules.csv', 'w') as file:
        file.write("Student Name, Class Name, Teacher Name, Start Time, End Time\n")
        for student in set(students + overflow_students):
            for section in student.get_schedule():
                file.write(f"{student.name}, {LEVEL_DICT[section.get_level()]} {section.get_subject()}, {section.get_teacher().name}, {section.get_time().start} {section.get_time().end}\n")

    
    


        
if __name__ == "__main__":
    main()