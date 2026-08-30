/**
 * File: stp-scheduler/frontend/app/schedules/[studentId]/page.tsx
 * Author: Addison A (ShadowArcher289)
 * Created: i need to check :(
 * Last Updated: 06/26/2026
 * 
 * Editors:
 *  
 * Summary: A page for a student-specific schedule. The path allows react to setup unique pages for each student's schedule based on the student's ID.
 */

'use client'

import { instructor_data, section_data, student_data } from "../../GetFromApi";
import { InstructorProps } from "../../InstructorProps";
import StudentSchedule from "../../Components/StudentSchedule";
import { StudentProps } from "../../StudentProps";
import { getStudentById } from "../../HelperFunctions";
import { useEffect, useState } from "react";
import * as GetAPI from "../../GetFromApi";
import { useParams } from "next/navigation";
import { regenerateSchedule } from "@/app/SendToApi";

export default function StudentSchedulePage(){
  const params = useParams();

  const [student, setStudent] = useState<StudentProps>({} as StudentProps);
  const [mySections, setMySections] = useState(section_data);
  const [myInstructors, setMyInstructors] = useState(instructor_data);

  useEffect(() => {
    async function fetchData(){
      await GetAPI.getFromBackendApi("Instructors");
      await GetAPI.getFromBackendApi("Students");
      await GetAPI.getFromBackendApi("Sections");
      await regenerateSchedule();

      setMySections(section_data);
      setMyInstructors(instructor_data);
      setStudent(getStudentById(student_data, params.studentId as string));
    }
  
    fetchData();

    console.log(params)
    console.log(params.studentId)
    console.log(student_data)
    console.log(student);
  }, []);

  if (student?.name == null) return <div className="text-black">Student not found.</div>;

  return (
    <StudentSchedule student={student as StudentProps} instructors={myInstructors as InstructorProps[]} sections={mySections}></StudentSchedule>
  );
}