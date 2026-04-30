import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import * as API from '../SendToApi';
import { getFromBackendApi, teacher_data } from "../GetFromApi";

export default function DeleteTeacher(){
    const [teacherId, setTeacherId] = useState<string>("");
    const [teachers, setTeachers] = useState<TeacherProps[]>([])

    /**
     * Delete a student
     * 
     * @param e FormEvent<HTMLFormElement>
     */
    function deleteTeacher(e: FormEvent<HTMLFormElement>){
        e.preventDefault(); // prevents page reload on form submission

        console.log("Teacher Deletion Initiated: ");
        console.log("teacher_id: " + teacherId);

        API.deleteTeacher(teacherId);

        e.currentTarget.reset(); // reset the data
        setTeacherId("");

        // Reload teachers without the deleted teacher
        getFromBackendApi("Teachers");
        setTeachers(teacher_data);
    }

    useEffect(() => {
        setTeachers(teacher_data)
    }, []);

    return (
        <details className="mb-2">
            <summary className="hover:backdrop-brightness-125 p-4"> Delete Instructor (Click to collapse/expand)</summary>
            <div className={"border-2 p-4 m-4 ml-0 border-white/50"}>
                <form name="createStudentForm" onSubmit={(e) => deleteTeacher(e)}>

                    <label className={"p-2 pr-4"} >Instructors:</label> 
                    
                    {/* Generate list of all selectable sections */}
                    <select className={"border-2 m-4 pt-4 pb-4 border-white/50"} onChange={(e) => {setTeacherId(e.target.value)}}>
                        <option className="mb-2 border-b border-white/50 text-gray" value="">
                        ...
                        </option>
                        {Object.entries(teachers).map(([key, teacher]) => {
                            return (
                                <option key={key} className="mb-2 border-b border-white/50 text-black" id={teacher.id} value={teacher.id}>
                                    {teacher.name} | {teacher.id} 
                                </option>
                            );
                        })
                        }
                    </select>

                    <button type="submit" className={"border-2 p-1 ml-4 w-35 hover:backdrop-brightness-125 active:backdrop-brightness-90"}>Delete</button>
                </form>
            </div>
        </details>
    );
}