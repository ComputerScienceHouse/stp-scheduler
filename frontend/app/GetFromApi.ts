

export var teacher_data: any = [];
export var student_data: any = [];
export var section_data: any = [];

export var section_ids: any = [];

export function setGlobalTeacherData(data: any){teacher_data = data}
export function setGlobalStudentData(data: any){student_data = data}
export function setGlobalSectionData(data: any){section_data = data}

export function setSectionIds(ids: any){section_ids = ids}


/**
 * Runs fetch a request to retrieve specified data from the backend and calls to set the .json file to it
 */
export async function getFromBackendApi(type: string){
    try {
        const response = await fetch('http://localhost:8000/' + type.toLowerCase());

        if (!response.ok) { 
            throw new Error(`HTTP error! status: ${response.status}`); 
        }

        const result = await response.json();
        console.log(result);

        switch (type) {
            case "Teachers":
                teacher_data = result;
                // console.log("Teacher data:\n" + teacher_data.toString())
                // setTeacherData(teacher_data);
                return;

            case "Students":
                student_data = result;
                // console.log("Student data:\n" + student_data.toString())
                // setStudentData(student_data);
                return;

            case "Sections":

                var ids: string[] = [];
                result.forEach((element: Record<string, any>) => {
                    ids.push(element.id);
                });
                section_ids = ids;
                
                section_data = result;
                
                section_data.forEach((element: { days: string[]; }) => { // REMOVE LATER: the backend does not set days, these lines should be removed once it does.
                    element.days = ["M", "T", "W", "R", "F"]; 
                });
                // console.log("Sections data:\n" + section_data.toString())
                
                return;
                
            default:
                return;
        }


    } catch (err) {
        console.log("ERROR: The backend did not retrieve data: " + err);
        alert("Error, database is not running, please refresh the page and try again or contact the Computer Science House");  
    }
}

