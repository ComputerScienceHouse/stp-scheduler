import type { InstructorProps } from "./InstructorProps";
import type { StudentProps } from "./StudentProps";

type Subjects = Record<string, number>;

/**
 * Returns the name of an instructor given their id.
 * @param instructors InstructorProps[]
 * @param instructorId string
 * @returns string
 */
export function getInstructorName(
  instructors: Array<InstructorProps>,
  instructorId: string,
): string {
  const match = instructors.find((i) => i.id === instructorId);
  if (match) {
    return match.name;
  }
  return "";
}

/**
 * Returns the mentor status of an instructor given their id.
 * @param instructors InstructorProps[]
 * @param instructorId string
 * @returns boolean
 */
export function getInstructorMentorStatus(
  instructors: Array<InstructorProps>,
  instructorId: string,
): boolean {
  const match = instructors.find((i) => i.id === instructorId);
  if (match) {
    return match.is_mentor;
  }
  return false;
}

/**
 * Returns the sections an instructor is teaching given their id.
 * @param instructors InstructorProps[]
 * @param instructorId string
 * @returns Array<string>
 */
export function getInstructorSections(
  instructors: Array<InstructorProps>,
  instructorId: string,
): string[] {
  const match = instructors.find((i) => i.id === instructorId);
  if (match) {
    return match.sectionIds;
  }
  return [];
}

/**
 * Returns the subject weights of an instructor given their id.
 * @param instructors InstructorProps[]
 * @param instructorId string
 * @returns Record<string, number>
 */
export function getInstructorSubjectWeights(
  instructors: Array<InstructorProps>,
  instructorId: string,
): Subjects {
  const match = instructors.find((i) => i.id === instructorId);
  if (match) {
    return match.subjects as unknown as Subjects;
  }
  return {} as Subjects;
}

/**
 * Returns the name of a student given their id.
 * @param students StudentProps[]
 * @param studentId string
 * @returns string
 */
export function getStudentName(
  students: Array<StudentProps>,
  studentId: string,
): string {
  const match = students.find((student) => student.id === studentId);
  if (match) {
    return match.name;
  }
  return "";
}

/**
 * Returns the sections a student is a part of
 * @param students StudentProps[]
 * @param studentId string
 * @returns string
 */
export function getStudentSections(
  students: Array<StudentProps>,
  studentId: string,
): string[] {
  const match = students.find((student) => student.id === studentId);
  if (match) {
    return match.sectionIds;
  }
  return [];
}

/**
 * Returns the subject rankings of a student
 * @param students StudentProps[]
 * @param studentId string
 * @returns Record<string, number>
 */
export function getStudentSubjectRankings(
  students: Array<StudentProps>,
  studentId: string,
): Subjects {
  const match = students.find((student) => student.id === studentId);
  if (match) {
    return match.subject_rankings as unknown as Subjects;
  }
  return {} as Subjects;
}

/**
 * given a list of students and a studentId, returns the student object with that id
 * @param students StudentProps[]
 * @param studentId string
 * @returns StudentProps
 */
export function getStudentById(
  students: Array<StudentProps>,
  studentId: string,
): StudentProps {
  const match = students.find((student) => student.id === studentId);
  if (match) {
    return match;
  }
  return { id: "", name: "", subject_rankings: {}, sectionIds: [] };
}

/**
 * returns a background color based on the provided subject's type
 * @param subject string
 * @returns string
 */
export function getBackgroundColor(subject: string): string {
  switch (subject.toLowerCase()) {
    case "math":
      return "#4a86e8ff";
    case "english":
      return "#f1a117ff";
    case "asl":
      return "#80c362ff";
    default:
      console.log("Invalid subject for 'getBackgroundColor()'");
      return "";
  }
}
