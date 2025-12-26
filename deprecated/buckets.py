from student import Student
from typing import List, Dict
import math

class Buckets:
    """    
    3 lists for each of the three types
    begining intermediate high
    1. english
    2. math
    3. ASL
    listed in priorty order. 
    this assumes a list sorted by name, english, math, asl is students.
    """
    beginningEnglish: list = []
    intermediateEnglish: list = []
    advancedEnglish: list = []

    beginningMath: list = []
    intermediateMath: list = []
    advancedMath: list = []

    beginningASL: list = []
    intermediateASL: list = []
    advancedASL: list = []
    
    size_dict = {}
    bucket_dict = {}
    count_dict = {}
    
    def sort_courses(self, students: List[Student]) -> None:
        for student in students:    
            # Put into proper English bucket
            if student.english <= 3:
                self.beginningEnglish.append(student)
            elif student.english > 6:
                self.advancedEnglish.append(student)
            else:
                self.intermediateEnglish.append(student)

            # Put into proper Math bucket
            if student.math <= 3:
                self.beginningMath.append(student)
            elif student.math > 6:
                self.advancedMath.append(student)
            else:
                self.intermediateMath.append(student)
            
            #put into proper ASL bucket. 
            if student.asl <= 3:
                self.beginningASL.append(student)
            elif student.asl > 6:
                self.advancedASL.append(student)
            else:
                self.intermediateASL.append(student)

        self.bucket_dict = {
            "beginningEnglish": self.beginningEnglish,
            "intermediateEnglish": self.intermediateEnglish,
            "advancedEnglish": self.advancedEnglish,
            "beginningMath": self.beginningMath,
            "intermediateMath": self.intermediateMath,
            "advancedMath": self.advancedMath,
            "beginningASL": self.beginningASL,
            "intermediateASL": self.intermediateASL,
            "advancedASL": self.advancedASL
        }
        self.size_dict = {
            "beginningEnglish": len(self.beginningEnglish),
            "intermediateEnglish": len(self.intermediateEnglish),
            "advancedEnglish": len(self.advancedEnglish),
            "beginningMath": len(self.beginningMath),
            "intermediateMath": len(self.intermediateMath),
            "advancedMath": len(self.advancedMath),
            "beginningASL": len(self.beginningASL),
            "intermediateASL": len(self.intermediateASL),
            "advancedASL": len(self.advancedASL)
        }
    
    def get_buckets(self) -> List[List[Student]]:
        return [
            self.beginningEnglish,
            self.intermediateEnglish,
            self.advancedEnglish,
            self.beginningMath,
            self.intermediateMath,
            self.advancedMath,
            self.beginningASL,
            self.intermediateASL,
            self.advancedASL
        ]
        
    def get_bucket_sizes(self) -> List[int]:
        return [
            len(self.beginningEnglish),
            len(self.intermediateEnglish),
            len(self.advancedEnglish),
            len(self.beginningMath),
            len(self.intermediateMath),
            len(self.advancedMath),
            len(self.beginningASL),
            len(self.intermediateASL),
            len(self.advancedASL)
        ]
    
    def set_class_count(self, class_limit = 7) -> None:
        """
        Returns a list of tuples containing the course name and the number of sections.
        """
        for key, size in self.size_dict.items():
            if size == 0:
                self.count_dict[key] = 0
            else:
                self.count_dict[key] = math.ceil(size / class_limit)
    
    def get_class_count(self) -> Dict:
        return self.count_dict
    
    def get_bucket_dict(self) -> Dict:
        return self.bucket_dict
    
    def get_size_dict(self) -> Dict:
        return self.size_dict
    
    def __str__(self) -> str:
        sizes = self.get_bucket_sizes()
        return f"""
        Beginning English: {sizes[0]}
        Intermediate English: {sizes[1]}
        Advanced English: {sizes[2]}
        
        Beginning Math: {sizes[3]}
        Intermediate Math: {sizes[4]}
        Advanced Math: {sizes[5]}
        
        Beginning ASL: {sizes[6]}
        Intermediate ASL: {sizes[7]}
        Advanced ASL: {sizes[8]}
        """
        
    def __repr__(self) -> str:
        return self.__str__()
    
if __name__ == "__main__":
    # Test the Buckets class
    students = [
        Student("Alice", 2, 8, 4),
        Student("Bob", 5, 1, 8),
        Student("Charlie", 1, 2, 3),
        Student("David", 7, 5, 4)
    ]
    
    buckets = Buckets()
    buckets.sortcourses(students)
    
    print(buckets)
        