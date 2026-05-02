/**
 * Interface for a Section on the schedule
 */
export interface SectionProps {
  id: string;
  subject: string;
  level: number;
  timeBlockId: number;
  days: string[];
  studentIds: Array<string>;
  instructorId: string;
}
