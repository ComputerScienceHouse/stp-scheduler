/**
 * Interface for a Section on the schedule
 */
interface SectionProps {
    id: string, 
    subject: string, 
    level: number, 
    timeBlockId: number, 
    days: string[], 
    studentIds: Array<string>, 
    teacherId: string
}