import { FormEvent, useEffect, useState } from "react";
import * as API from "../SendToApi";
import { getFromBackendApi } from "../GetFromApi";
import type { InstructorProps } from "../InstructorProps";

interface DeleteInstructorProps{
    instructors: InstructorProps[];
}
export default function DeleteTeacher({instructors}: DeleteInstructorProps) {
  const [instructorId, setInstructorId] = useState<string>("");

  /**
   * Delete an instructor
   * 
   * @param e FormEvent<HTMLFormElement>
   */
  function deleteInstructorHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    API.deleteInstructor(instructorId);

    e.currentTarget.reset();
    setInstructorId("");

    // TODO: update delete instructor in the API to do this because the file should not be responsible for re-updating data
    // getFromBackendApi("Instructors");
  }

  return (
    <details className="mb-2">
      <summary className="hover:backdrop-brightness-125 p-4">
        {" "}
        Delete Instructor (Click to collapse/expand)
      </summary>
      <div className={"border-2 p-4 m-4 ml-0 border-white/50"}>
        <form name="deleteInstructorForm" onSubmit={(e) => deleteInstructorHandler(e)}>
          <label className={"p-2 pr-4"}>Instructors:</label>

          <select
            className={"border-2 m-4 pt-4 pb-4 border-white/50"}
            onChange={(e) => {
              setInstructorId(e.target.value);
            }}
          >
            <option className="mb-2 border-b border-white/50 text-gray" value="">
              ...
            </option>
            {instructors.map((inst) => (
              <option
                key={inst.id}
                className="mb-2 border-b border-white/50 text-black"
                id={inst.id}
                value={inst.id}
              >
                {inst.name} | {inst.id}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className={
              "border-2 p-1 ml-4 w-35 hover:backdrop-brightness-125 active:backdrop-brightness-90"
            }
          >
            Delete
          </button>
        </form>
      </div>
    </details>
  );
}
