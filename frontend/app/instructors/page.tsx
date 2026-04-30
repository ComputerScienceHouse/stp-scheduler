"use client"

import { useEffect, useState } from "react";
import * as GetAPI from "../GetFromApi";

export default function InstructorsPage(){
    const [teacherData, setTeacherData] = useState<TeacherProps[]>([]);

    /**
     * calls the GetAPI to repopulate its data
     */
    useEffect(() => {
        const fetchData = async () => {
            await GetAPI.getFromBackendApi("Teachers");
            setTeacherData(GetAPI.teacher_data);
        };

        fetchData();
    }, [])

    return (
        <div className="text-black content-center">
            <h2 className=" text-end pr-8 mt-4 mb-1 text-lg"><b>{teacherData.length}</b> Total Instructors</h2>
            <ul className="flex flex-wrap w-dvw justify-left list-decimal p-4 pl-16" style={{overflowY: "auto", overflowX: "clip", height: "80vh"}}>
                {teacherData.map((teacher) => (
                    <li key={teacher.id} className="m-8 mt-1 mb-1 pl-1 pr-1 text-xs">
                        <b>id: | name: | is a mentor: | subjects:</b> <br />
                        {teacher.id}<br />
                        {teacher.name}<br />
                        {teacher.is_mentor ? "Mentor" : "Not a Mentor"}<br />
                        {JSON.stringify(teacher.subjects)}<br />
                        <br />
                    </li>
                ))}
            </ul>
        </div>
    );
}