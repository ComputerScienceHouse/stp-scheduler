import localData from "../../data/BackendData.json";
import { getStudentName, getTeacherName } from "../HelperFunctions";

/**
 * Author: Addison A
 * Last Updated: 12/26/2025
 * 
 * Editors: 
 */

interface SectionCardProps{
    section: SectionProps
    teachers: TeacherProps[]
    students: StudentProps[]
}

/**
 * returns a background color based on the subject of the section
 * @param subject string
 * @returns string "valid css color"
 */
function getBackgroundColor(subject: string){
    switch (subject.toLowerCase()) {
        case "math":
            return "#ff4040ff";
        case "english":
            return "#4a86e8ff";
        case "asl":
            return "#80c362ff"
        default:
            console.log("Invalid subject inputted");
            break;
    }
}

export function getSectionLevel(level: number): string{
    switch(level){
        case 0:
            return "Beginner";
        case 1:
            return "Intermediate";  
        case 2:
            return "Advanced";  
        default:
            return "";
    }
}

export default function Section(
    // {
    //     id, 
    //     subject, 
    //     level, 
    //     timeBlockId, 
    //     days, 
    //     studentIds, 
    //     teacherId
    // }: SectionProps, teachers: TeacherProps[]
    {section, teachers, students}: SectionCardProps
){
    return(
        <div 
            className="flex grow col-span-1 row-span-1 p-4 pl-2 pr-2 text-lg justify-center items-center rounded-2xl flex-col"
            style={{
                backgroundColor: getBackgroundColor(section.subject),
            }}
        >
            {getTeacherName(teachers as Array<TeacherProps>, section.teacherId)} - {getSectionLevel(section.level)} {section.subject.charAt(0).toUpperCase() + section.subject.slice(1)}
            <br />
            <br />
            <ul className="list-decimal text-left text-base">
            {
                section.studentIds.map((id) => (
                    <li key={id}> {getStudentName(students, id)}</li>
                ))
            }
            </ul>
        </div>
    );
}