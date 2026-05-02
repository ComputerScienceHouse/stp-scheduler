/**
 * Handles retrieving data from the backend
 *
 * Author: Addison A
 * Last Updated: 4/30/2026
 */
import { apiFetch } from "./apiClient";

/** Global data for all instructors */
export var instructor_data: any = [];
/** Global data for all students */
export var student_data: any = [];
/** Global data for all sections */
export var section_data: any = [];
/** Global data for all section_ids */
export var section_ids: any = [];

export function setGlobalInstructorData(data: any) {
  instructor_data = data;
}

export function setGlobalStudentData(data: any) {
  student_data = data;
}

export function setGlobalSectionData(data: any) {
  section_data = data;
}

export function setSectionIds(ids: any) {
  section_ids = ids;
}

/**
 * Fetches data from the backend. Use type "Instructors", "Students", or "Sections".
 */
export async function getFromBackendApi(type: string) {
  try {
    const response = await apiFetch(`/${type.toLowerCase()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);

    switch (type) {
      case "Instructors":
        instructor_data = result;
        return;

      case "Students":
        student_data = result;
        return;

      case "Sections":
        var ids: string[] = [];
        result.forEach((element: Record<string, any>) => {
          ids.push(element.id);
        });
        section_ids = ids;

        section_data = result;

        section_data.forEach((element: { days: string[] }) => {
          element.days = ["M", "T", "W", "R", "F"];
        });

        return;

      default:
        return;
    }
  } catch (err) {
    console.log("ERROR: The backend did not retrieve data: " + err);
    alert(
      "Error, database is not running, please refresh the page and try again or contact the Computer Science House",
    );
  }
}
