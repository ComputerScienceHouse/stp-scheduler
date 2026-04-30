import math
from student import Student
from constants import get_level


class Bucket:
    def __init__(self, level: int, subject: str):
        self.level = level
        self.subject = subject
        self.students = []
    
    def add_student(self, student) -> None:
        if student not in self.students:
            self.students.append(student)
            
    def assign_students(self, students: list[Student]) -> None:
        for student in students:
            if get_level(student.get_subject_rankings()[self.subject]) == self.level:
                self.add_student(student)
                
    def get_sections_needed(self, class_limit: int = 7) -> int:
        return math.ceil(self.get_size() / class_limit)

    def get_size(self) -> int:
        return len(self.students)
    
    def get_students(self) -> list:
        return self.students
    
    def __hash__(self):
        return hash((self.level, self.subject))
    
    def __str__(self):
        level_str = {0: "Beginning", 1: "Intermediate", 2: "Advanced"}.get(self.level, "Unknown")
        return f"{level_str} {self.subject.capitalize()}"
    
    def __repr__(self):
        return self.__str__()
    
def create_buckets() -> tuple[list[Bucket], dict[str, Bucket]]:
    subjects = ["english", "math", "asl"]
    levels = [0, 1, 2]  # 0: beginning, 1: intermediate, 2: advanced
    buckets = []
    
    for subject in subjects:
        for level in levels:
            buckets.append(Bucket(level, subject))
            
    buckets_dict = {str(bucket): bucket for bucket in buckets}
    
    return buckets, buckets_dict

if __name__ == "__main__":
    buckets, buckets_dict = create_buckets()
    for bucket in buckets:
        print(bucket)
        
    print(buckets_dict)
    
    students = [
        Student("Alice", 2, 5, 8),
        Student("Bob", 7, 3, 1),
        Student("Charlie", 4, 6, 2),
        Student("David", 1, 9, 5)
    ]
    
    for bucket in buckets:
        bucket.assign_students(students)
        print(f"{bucket}: {bucket.get_size()} students")
        print(f"Students: {bucket.get_students()}")