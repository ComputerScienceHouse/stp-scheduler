/**
 * Handles api calls to the backend
 * 
 * Author: Addison A
 * Last Updated: 2/20/2026
 * 
 * Edited by:
 * 
 */

/**
 * TODO: Implement this
 * Generates and returns an id string
 * @returns string, "fake-id"
 */
export function generateId(){
    return "fake-id";
}

/**
 * Sends a POST request to update the data in the backend given an entire csv file
 * @param csvData 
 */
export function updateFromCSV(csvData: any){
    try{
        var result: any;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(csvData)
        };

        fetch('http://localhost:8000/csv/update', requestOptions)
            .then(response => response.json())
            .then(data => result); // NOTE: This is the response data from the backend, idk what to do with it yet.

        return result;
    } catch (error) {
        alert("Error, database is not running, please refresh the page and try again or contact the Computer Science House");  
    }
}


/**
 * Sends a POST request to have the schedule code re-run, generating a completely new schedule
 * @param csvData 
 */
export function regenerateSchedule(){
    try {
        var result: any;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        fetch('http://localhost:8000/schedule/regenerate', requestOptions)
            .then(response => response.json())
            .then(data => result); // NOTE: This is the response data from the backend, idk what to do with it yet.

        return result;
    } catch (error) {
        alert("Error, database is not running, please refresh the page and try again or contact the Computer Science House");  
    }
}


/**
 * Sends a POST request to create a teacher in the backend
 * @param teacher 
 * @returns 
 */
export function createTeacher(teacher: TeacherModel){
    var result: any;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacher)
    };

    fetch('http://localhost:8000/teachers/create', requestOptions)
        .then(response => response.json())
        .then(data => result); // NOTE: This is the response data from the backend, idk what to do with it yet.

    return result;
}

/**
 * Sends a PUT request to edit a teacher in the backend
 * @param teacher 
 * @returns 
 */
export function editTeacher(teacher: any){
    var result: any;
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacher)
    };

    fetch('http://localhost:8000/teachers/update', requestOptions)
        .then(response => response.json())
        .then(data => result); // NOTE: This is the response data from the backend, idk what to do with it yet.

    return result;
}

/**
 * Sends a DELETE request to delete a teacher in the backend
 * @param teacherId
 * @returns 
 */
export function deleteTeacher(teacher_id: string){
    var result: any;
    const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    };

    fetch(`http://localhost:8000/teachers/delete?teacher_id=${encodeURIComponent(teacher_id)}`, requestOptions)
        .then(response => response.json())
        .then(data => result); // NOTE: This is the response data from the backend, idk what to do with it yet.

    return result;
}

interface TeacherModel{
    id?: string,
    name: string,
    subject_weights: Record<string, number>,
    sections?: number,
    is_mentor: boolean
}

interface StudentModel{
    id?: string,
    name: string,
    subject_abilities: Record<string, number>,
    section_ids?: string[]
}

/**
 * Sends a POST request to create a student in the backend
 * @param student
 * @returns 
 */
export function createStudent(student: StudentModel){
    var result: any;

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
    };

    fetch('http://localhost:8000/students/create', requestOptions)
        .then(response => response.json())
        .then(data => result); // NOTE: This is the response data from the backend, idk what to do with it yet.
        
    return result;
}

/**
 * Sends a PUT request to edit a student in the backend
 * @param student 
 * @returns 
 */
export function editStudent(student: any){
    var result: any;

    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
    };

    fetch('http://localhost:8000/students/update', requestOptions)
        .then(response => response.json())
        .then(data => result); // NOTE: This is the response data from the backend, idk what to do with it yet.
        
    return result;
}

/**
 * Sends a DELETE request to delete a student in the backend
 * @param studentId
 * @returns 
 */
export function deleteStudent(student_id: string){
    var result: any;

    const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    };

    fetch(`http://localhost:8000/students/delete?student_id=${encodeURIComponent(student_id)}`, requestOptions)
        .then(response => response.json())
        .then(data => result); // NOTE: This is the response data from the backend, idk what to do with it yet.
        
    return result;
}


// UNUSED:
/**
 * Sends a POST request to create a section in the backend
 * @param section 
 * @returns 
 */
export function createSection(section: string){   
    var result: any;

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: section
    };

    fetch('http://localhost:8000/create/section', requestOptions)
        .then(response => response.json())
        .then(data => result); // NOTE: This is the response data from the backend, idk what to do with it yet.
    
    return result;
}

/**
 * Sends a POST request to create a timeblock in the backend
 * @param timeblock 
 * @returns 
 */
export function createTimeblock(timeblock: string){
    var result: any;

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: timeblock
    };

    fetch('http://localhost:8000/create/timeblock', requestOptions)
        .then(response => response.json())
        .then(data => result); // NOTE: This is the response data from the backend, idk what to do with it yet.

    return result;
}