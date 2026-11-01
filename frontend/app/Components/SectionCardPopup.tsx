/**
 * File: stp-scheduler/frontend/app/Components/SectionCardPopup.tsx
 * Author: Addison A (ShadowArcher289)
 * Created: 10/31/2026
 * Last Updated: 10/31/2026
 * 
 * Editors:
 *  
 * Summary: A popup for managing data in a given Section.
 */

'use client'

import { useState } from "react";
import { getStudentName, getInstructorName } from "../HelperFunctions";
import type { InstructorProps } from "../InstructorProps";
import { SectionProps } from "../SectionProps";
import { StudentProps } from "../StudentProps";

interface SectionCardPopupProps {
  section: SectionProps;
  instructors: InstructorProps[];
  students: StudentProps[];
}


export default function SectionCardPopup({ section, instructors, students }: SectionCardPopupProps){
    const [query, setQuery] = useState("");

    const filteredInstructors = instructors.filter((instructor: InstructorProps) =>
    instructor.name.toLowerCase().includes(query.toLowerCase())
    );

    return(
        <>
            {/* // instructor full name */}
            <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Name..."
            />

            <select>
                {filteredInstructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                        {getInstructorName(instructors, section.instructorId)} | {"Instructor top sections"}
                    </option>
                ))}
            </select>

            {/* // class name */}

            {/* // class level */}
            <input name="class_level" type="number" min={0} step={1} placeholder="1"></input>


            <p>Students:</p>
            <ul>
                <li><button>Add/Create</button></li>
                {
                    students.map((student) => (
                        <li key={student.id}>{getStudentName(students, student.id)} <button>-(Remove button)</button></li>
                    ))
                }
            </ul>
            {/* // list
            // add/create button
            // students */}
            
        </>
    );
}
