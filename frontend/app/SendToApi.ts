/**
 * Handles api calls to the backend
 *
 * Author: Addison A
 * Edited By: Logan E
 * Last Updated: 4/30/2026
 */

import { apiFetch } from "./apiClient";
import { getFromBackendApi } from "./GetFromApi";

export function generateId() {
  return "fake-id";
}

/**
 * POST /csv/update
 * @param csvData the data the backend will update with
 * @returns 
 */
export function updateFromCSV(csvData: any) {
  try {
    var result: any;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(csvData),
    };

    apiFetch(`/csv/update`, requestOptions)
      .then((response) => response.json())
      .then((data) => (result = data));

    return result;
  } catch (error) {
    console.log(
      "Error, database is not running, please refresh the page and try again or contact the Computer Science House"
    );
  }
}

/**
 * POST /schedule/regenerate 
 * @returns 
 */
export function regenerateSchedule() {
  try {
    var result: any;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };

    apiFetch(`/schedule/regenerate`, requestOptions)
      .then((response) => response.json())
      .then((data) => (result = data));

    return result;
  } catch (err) {
    alert(
      "ERROR: The backend did not regenerate data: " + err,
    );
  }
}

/** Replace all students from an uploaded CSV (multipart). */
export async function importStudentsCsv(file: File): Promise<{ imported: number }> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await apiFetch("/import/students", { method: "POST", body: fd });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || r.statusText);
  }
  return r.json();
}

/** Replace all instructors from an uploaded CSV (multipart). */
export async function importInstructorsCsv(file: File): Promise<{ imported: number }> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await apiFetch("/import/instructors", { method: "POST", body: fd });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || r.statusText);
  }
  return r.json();
}

export function createInstructor(instructor: InstructorModel) {
  var result: any;
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(instructor),
  };

  apiFetch(`/instructors/create`, requestOptions)
    .then((response) => response.json())
    .then(() => getFromBackendApi("Instructors"))
    .then((data) => (result = data));

  return result;
}

export function editInstructor(instructor: any) {
  var result: any;
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(instructor),
  };

  apiFetch(`/instructors/update`, requestOptions)
    .then((response) => response.json())
    .then(() => getFromBackendApi("Instructors"))
    .then((data) => (result = data));

  return result;
}

export function deleteInstructor(instructor_id: string) {
  var result: any;
  const requestOptions = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  };

  apiFetch(
    `/instructors/delete?instructor_id=${encodeURIComponent(instructor_id)}`,
    requestOptions,
  )
    .then((response) => response.json())
    .then(() => getFromBackendApi("Instructors"))
    .then((data) => (result = data));

  return result;
}

interface InstructorModel {
  id?: string;
  name: string;
  subject_weights: Record<string, number>;
  sections?: number;
  is_mentor: boolean;
}

interface StudentModel {
  id?: string;
  name: string;
  subject_abilities: Record<string, number>;
  section_ids?: string[];
}

export function createStudent(student: StudentModel) {
  var result: any;

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  };

  apiFetch(`/students/create`, requestOptions)
    .then((response) => response.json())
    .then(() => getFromBackendApi("Students"))
    .then((data) => (result = data));

  return result;
}

export function editStudent(student: any) {
  var result: any;

  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  };

  apiFetch(`/students/update`, requestOptions)
    .then((response) => response.json())
    .then(() => getFromBackendApi("Students"))
    .then((data) => (result = data));

  return result;
}

export function deleteStudent(student_id: string) {
  var result: any;

  const requestOptions = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  };

  apiFetch(`/students/delete?student_id=${encodeURIComponent(student_id)}`, requestOptions)
    .then((response) => response.json())
    .then(() => getFromBackendApi("Students"))
    .then((data) => (result = data));

  return result;
}

export function createSection(section: string) {
  var result: any;

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: section,
  };

  apiFetch(`/create/section`, requestOptions)
    .then((response) => response.json())
    .then(() => getFromBackendApi("Sections"))
    .then((data) => (result = data));

  return result;
}

export function createTimeblock(timeblock: string) {
  var result: any;

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: timeblock,
  };

  apiFetch(`/create/timeblock`, requestOptions)
    .then((response) => response.json())
    .then((data) => (result = data));

  return result;
}
