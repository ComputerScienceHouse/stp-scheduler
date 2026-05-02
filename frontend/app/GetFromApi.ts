/**
 * Handles retrieving data from the backend
 * 
 * Author: Addison A
 * Last Updated: 4/30/2026
 * 
 * Edited by:
 * 
 */
import { apiFetch } from "./apiClient";

/** Global data for all teachers */
export var teacher_data: any = [];
/** Global data for all students */
export var student_data: any = [];
/** Global data for all sections */
export var section_data: any = [];
/** Global data for all section_ids */
// TODO: refactor to remove section_ids
export var section_ids: any = [];

/**
 * Set the global teacher's data to the inputted data
 * @param data 
 */
export function setGlobalTeacherData(data: any){teacher_data = data}
/**
 * Set the global student's data to the inputted data
 * @param data 
 */
export function setGlobalStudentData(data: any){student_data = data}
/**
 * Set the global section's data to the inputted data
 * @param data 
 */
export function setGlobalSectionData(data: any){section_data = data}

/**
 * Set the global section_ids's data to the inputted data
 * @param data 
 */
export function setSectionIds(ids: any){section_ids = ids}


/**
 * Runs fetch a request to retrieve specified data from the backend and calls to set the .json file to it
 */
export async function getFromBackendApi(type: string){
    try {
        const response = await apiFetch(`/${type.toLowerCase()}`);
        
        if (!response.ok) { 
            throw new Error(`HTTP error! status: ${response.status}`); 
        }

        const result = await response.json();
        console.log(result);

        switch (type) {
            case "Teachers":
                teacher_data = result;
                // console.log("Teacher data:\n" + teacher_data.toString())
                return;

            case "Students":
                student_data = result;
                // console.log("Student data:\n" + student_data.toString())
                return;

            case "Sections":

                var ids: string[] = [];
                result.forEach((element: Record<string, any>) => {
                    ids.push(element.id);
                });
                section_ids = ids;
                
                section_data = result;
                
                section_data.forEach((element: { days: string[]; }) => { // TODO: REMOVE LATER: the backend currently does not set days, these lines should be removed once it does.
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

