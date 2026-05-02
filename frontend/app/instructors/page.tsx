"use client";

import { useEffect, useState } from "react";
import * as GetAPI from "../GetFromApi";
import type { InstructorProps } from "../InstructorProps";

export default function InstructorsPage() {
  const [instructorData, setInstructorData] = useState<InstructorProps[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await GetAPI.getFromBackendApi("Instructors");
      setInstructorData(GetAPI.instructor_data);
    };

    fetchData();
  }, []);

  return (
    <div className="text-black content-center">
      <h2 className=" text-end pr-8 mt-4 mb-1 text-lg">
        <b>{instructorData.length}</b> Total Instructors
      </h2>
      <ul
        className="flex flex-wrap w-dvw justify-left list-decimal p-4 pl-16"
        style={{ overflowY: "auto", overflowX: "clip", height: "80vh" }}
      >
        {instructorData.map((inst) => (
          <li key={inst.id} className="m-8 mt-1 mb-1 pl-1 pr-1 text-xs">
            <b>id: | name: | is a mentor: | subjects:</b> <br />
            {inst.id}
            <br />
            {inst.name}
            <br />
            {inst.is_mentor ? "Mentor" : "Not a Mentor"}
            <br />
            {JSON.stringify(inst.subjects)}
            <br />
            <br />
          </li>
        ))}
      </ul>
    </div>
  );
}
