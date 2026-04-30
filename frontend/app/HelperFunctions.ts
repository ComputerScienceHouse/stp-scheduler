/**
 * Given an array of teachers and a teacher's id, returns the name of a specified teacher.
 * @param teachers Array of Teachers
 * @param teacherId Id of the desired teacher
 * @returns string
 */
export function getTeacherName(teachers: Array<TeacherProps>, teacherId: string): string{
    const match = teachers.find(teacher => teacher.id === teacherId); // find the matching teacher

    if(match){ // if not unidentified, then return the name
        return match.name;
    }
    else{
        return "";
    }
}

/**
 * Given an array of students and a student's id, returns the name of a specified student.
 * @param students Array of Students
 * @param studentId Id of the desired student
 * @returns string
 */
export function getStudentName(students: Array<StudentProps>, studentId: string): string{
    const match = students.find(student => student.id === studentId); // find the matching student

    if(match){ // if not unidentified, then return the name
        return match.name;
    }
    else{
        return "";
    }
}



/**
 * Given an array of students and a student's id, returns the name of a specified student.
 * @param students Array of Students
 * @param studentId Id of the desired student
 * @returns string
 */
export function getStudentById(students: Array<StudentProps>, studentId: string): StudentProps{
    const match = students.find(student => student.id === studentId); // find the matching student

    if(match){ // if not unidentified, then return the name
        return match;
    }
    else{
        return {id: "", name:"", subject_rankings: {}, sectionIds: []};
    }
}