// TODO: update gets to use the global data so that each individual file does not have to pass in a list of teachers, or students, etc.

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
 * Given an array of teachers and a teacher's id, returns the mentor status of a specified teacher.
 * @param teachers Array of Teachers
 * @param teacherId Id of the desired teacher
 * @returns boolean
 */
export function getTeacherMentorStatus(teachers: Array<TeacherProps>, teacherId: string): boolean{
    const match = teachers.find(teacher => teacher.id === teacherId); // find the matching teacher

    if(match){ // if not unidentified, then return the mentor status
        return match.is_mentor;
    }
    else{
        return false;
    }
}

/**
 * Given an array of teachers and a teacher's id, returns the name of a specified teacher.
 * @param teachers Array of Teachers
 * @param teacherId Id of the desired teacher
 * @returns string[]
 */
export function getTeacherSections(teachers: Array<TeacherProps>, teacherId: string): string[]{
    const match = teachers.find(teacher => teacher.id === teacherId); // find the matching teacher

    if(match){ // if not unidentified, then return the sectionIds
        return match.sectionIds;
    }
    else{
        return [];
    }
}

/**
 * Given an array of teachers and a teacher's id, returns the subject preference weights of a specified teacher.
 * @param teachers Array of Teachers
 * @param teacherId Id of the desired teacher
 * @returns Record<string, number> as Subjects
 */
export function getTeacherSubjectWeights(teachers: Array<TeacherProps>, teacherId: string): Subjects{
    const match = teachers.find(teacher => teacher.id === teacherId); // find the matching teacher

    if(match){ // if not unidentified, then return the subject weights
        return match.subjects as unknown as Subjects;
    }
    else{
        return {} as Subjects;
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
 * Given an array of students and a student's id, returns the sections that student is a part of.
 * @param students Array of Students
 * @param studentId Id of the desired student
 * @returns string[]
 */
export function getStudentSections(students: Array<StudentProps>, studentId: string): string[]{
    const match = students.find(student => student.id === studentId); // find the matching student

    if(match){
        return match.sectionIds;
    }
    else{
        return [];
    }
}

/**
 * Given an array of students and a student's id, returns the subject rankings for that student.
 * @param students Array of Students
 * @param studentId Id of the desired student
 * @returns Record<string, number> as Subjects
 */
export function getStudentSubjectRankings(students: Array<StudentProps>, studentId: string): Subjects{
    const match = students.find(student => student.id === studentId); // find the matching student

    if(match){
        return (match.subject_rankings) as unknown as Subjects;
    }
    else{
        return {} as Subjects;
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