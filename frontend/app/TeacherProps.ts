/**
 * Interface for a Teacher on the schedule
 */
interface TeacherProps {
    id: string, 
    name: string,
    subjects: Record<string, number>, 
    sectionIds: Array<string>,
    is_mentor: boolean
}