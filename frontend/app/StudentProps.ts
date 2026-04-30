/**
 * Interface for a Student on the schedule
 */
interface StudentProps {
    id: string, 
    name: string,
    subject_rankings: Record<string, number>, 
    sectionIds: Array<string>
}