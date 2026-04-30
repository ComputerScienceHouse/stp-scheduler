class classes:
    # Creates classes that students will take
    # Name: Name of the Class, could be seperated into 'name, difficulty'
    # Times: Available times of the class
    # Capacity: How many students can take the class
    def __init__(self, ty, times, capacity, level, teacher):
        self.__ty = ty
        self.__time = times
        self.__cap = capacity
        self.__current_students = 0
        self.__level = level
        self.__teacher = teacher

    # Checks if the classs is at capacity
    def is_full(self):
        if self.__current_students == self.__cap:
            return True
        else:
            return False
    
    # adds a student to the class
    # eventually this could keep track of which students if desired
    # raises index error if class is at capacity
    # TODO: correct Error type, with handling
    def add_student(self):
        if self.is_full():
            return IndexError
        else:
            self.__current_students += 1


    def set_teacher(self,teacher):
        self.__teacher = teacher
    
    def get_teacher(self):
        return self.__teacher

    def get_time(self):
        return self.__time
    
    def get_level(self):
        return self.__level
    
    def get_type(self):
        return self.__ty
    