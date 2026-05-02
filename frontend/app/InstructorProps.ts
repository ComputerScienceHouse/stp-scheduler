/**
 * Interface for an instructor on the schedule.
 */
export interface InstructorProps {
  id: string;
  name: string;
  subjects: Record<string, number>;
  sectionIds: Array<string>;
  is_mentor: boolean;
}
