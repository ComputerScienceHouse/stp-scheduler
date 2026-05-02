import type { InstructorProps } from "./InstructorProps";
import type { StudentProps } from "./StudentProps";

type Subjects = Record<string, number>;

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
