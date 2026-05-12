'use client'

import { instructor_data, section_data, student_data } from "../../GetFromApi";
import { InstructorProps } from "../../InstructorProps";
import StudentSchedule from "../../Components/StudentSchedule";
import { StudentProps } from "../../StudentProps";
import { getStudentById } from "../../HelperFunctions";
import { useEffect, useState } from "react";
import * as GetAPI from "../../GetFromApi";
import { useParams } from "next/navigation";

export default function StudentSchedulePage(){
  const params = useParams();

  const [student, setStudent] = useState<StudentProps>({} as StudentProps);
    
  useEffect(() => {
      GetAPI.getFromBackendApi("Instructors");
      GetAPI.getFromBackendApi("Students");
      GetAPI.getFromBackendApi("Sections");
      setStudent(getStudentById(student_data, params.studentId as string));
    
      console.log(params)
      console.log(params.studentId)
      console.log(student_data)
      console.log(student);
  }, []);

  if (student?.name == null) return <div className="text-black">Student not found.</div>;

  return (
    <StudentSchedule student={student as StudentProps} instructors={instructor_data as InstructorProps[]} sections={section_data}></StudentSchedule>
  );
}