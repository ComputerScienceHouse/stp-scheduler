/**
 * File: stp-scheduler/frontend/app/Components/CreateInstructorPopup.tsx
 * Author: Addison A (ShadowArcher289)
 * Created: 10/31/2026
 * Last Updated: 10/31/2026
 * 
 * Editors:
 *  
 * Summary: A popup for creating an instructor.
 */

'use client'

import { useState } from "react";
import { getStudentName, getInstructorName } from "../HelperFunctions";

interface InstructorCardPopupProps {
  subjects: Subjects;
}


export default function SectionCardPopup({ subjects }: InstructorCardPopupProps){
    const [name, setName] = useState("");

    return(
        <>
            {/* // instructor full name */}
            <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Name..."
            />

            <ul>
                {/* { // turn subjects into an array of sorts to let this work
                    subjects.map((subject) => (
                        <li key={student.id}>{getStudentName(students, student.id)} <button>-(Remove button)</button></li>
                    ))
                } */}
                <li></li>
            </ul>
        </>
    );
}
