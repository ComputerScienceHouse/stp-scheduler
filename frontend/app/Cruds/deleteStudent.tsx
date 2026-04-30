import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import * as API from '../SendToApi';
import { getFromBackendApi, student_data } from "../GetFromApi";

export default function DeleteStudent(){
    const [studentId, setStudentId] = useState<string>("");
    const [students, setStudents] = useState<StudentProps[]>([])

    /**
     * Delete a student
     * 
     * @param e FormEvent<HTMLFormElement>
     */
    function deleteStudent(e: FormEvent<HTMLFormElement>){
        e.preventDefault(); // prevents page reload on form submission

        console.log("Student Deletion Initiated: ");
        console.log("student_id: " + studentId);

        API.deleteStudent(studentId);

        e.currentTarget.reset(); // reset the data
        setStudentId("");

        // Reload students without the deleted student
        getFromBackendApi("Students");
        setStudents(student_data);
    }

    useEffect(() => {
        setStudents(student_data)
    }, []);

    return (
        <details className="mb-2">
            <summary className="hover:backdrop-brightness-125 p-4"> Delete Student (Click to collapse/expand)</summary>
            <div className={"border-2 p-4 m-4 ml-0 border-white/50"}>
                <form name="createStudentForm" onSubmit={(e) => deleteStudent(e)}>

                    <label className={"p-2 pr-4"} >Students:</label> 
                    {/* <input type="text" id="sections" className={"border-2 p-1 hover:backdrop-brightness-125 active:backdrop-brightness-90"}/> */}
                    
                    {/* Generate list of all selectable sections */}
                    <select className={"border-2 m-4 pt-4 pb-4 border-white/50"} onChange={(e) => {setStudentId(e.target.value)}}>
                        <option className="mb-2 border-b border-white/50 text-gray" value="">
                        ...
                        </option>
                        {Object.entries(students).map(([key, student]) => {

                            // incrementSectionCount();
                            // const [day, timeBlockId] = key.split("-");
                            return (
                                <option key={key} className="mb-2 border-b border-white/50 text-black" id={student.id} value={student.id}>
                                    {student.name} | {student.id}   
                                </option>
                            );
                        })
                        }
                    </select>

                    {/* <input type="checkbox" id="sections" className={"border-2 p-1 hover:backdrop-brightness-125 active:backdrop-brightness-90"}/> */}

                    <button type="submit" className={"border-2 p-1 ml-4 w-35 hover:backdrop-brightness-125 active:backdrop-brightness-90"}>Delete</button>
                </form>
            </div>
        </details>
    );
}