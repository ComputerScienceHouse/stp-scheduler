"use client";

import { useEffect, useState } from "react";
import * as XLSX from "@e965/xlsx";
import * as API from "../SendToApi";
import CreateStudent from "../Cruds/createStudent";
import CreateTeacher from "../Cruds/createTeacher";
import * as GetAPI from "../GetFromApi";
import EditStudent from "../Cruds/editStudent";
import EditTeacher from "../Cruds/editTeacher";
import DeleteStudent from "../Cruds/deleteStudent";
import DeleteTeacher from "../Cruds/deleteTeacher";
import { Tooltip } from "react-tooltip";

import { instructor_data, section_data, student_data } from "../GetFromApi";

interface InputPageProps {
  path: string;
}

function writeToJson(filePath: string, newJsonData: string) {
  console.log("Writing data:");
  console.log("Filepath: " + filePath);
  console.log("newJsonData: " + newJsonData);
}

export default function InputPage({ path }: InputPageProps) {
  const [instructorDataStr, setInstructorDataStr] = useState<string>("");
  const [studentDataStr, setStudentDataStr] = useState<string>("");
  const [sectionIds, setSectionIds] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any>("");

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      if (type.toLowerCase() === "instructors") {
        setInstructorDataStr(JSON.stringify(json, null, 2));
        GetAPI.setGlobalInstructorData(JSON.stringify(json, null, 2));
        writeToJson(path, JSON.stringify(json));
      } else if (type.toLowerCase() === "csv") {
        setCsvData(json);
        API.updateFromCSV(json);
      } else if (type.toLowerCase() === "student") {
        setStudentDataStr(JSON.stringify(json, null, 2));
        GetAPI.setGlobalStudentData(JSON.stringify(json, null, 2));
        writeToJson(path, JSON.stringify(json));
      }
    };

    reader.readAsBinaryString(file);
  }

  async function onStudentsCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const res = await API.importStudentsCsv(f);
      alert(`Imported ${res.imported} students from CSV.`);
      await GetAPI.getFromBackendApi("Students");
      await GetAPI.getFromBackendApi("Instructors");
    } catch (err) {
      alert(String(err));
    }
    e.target.value = "";
  }

  async function onInstructorsCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const res = await API.importInstructorsCsv(f);
      alert(`Imported ${res.imported} instructors from CSV.`);
      await GetAPI.getFromBackendApi("Instructors");
    } catch (err) {
      alert(String(err));
    }
    e.target.value = "";
  }

  useEffect(() => {
    GetAPI.getFromBackendApi("Instructors");
    GetAPI.getFromBackendApi("Students");
    GetAPI.getFromBackendApi("Sections");

    setSectionIds(GetAPI.section_ids);
  }, []);

  return (
    <div className={"p-4 pl-16 mb-4 border-b-2 bg-[#f76902] text-white"}>
      <Tooltip id="my-tooltip" />
      <div className="mb-4 border-2 p-4 rounded max-w-xl">
        <h3 className="font-semibold mb-2 text-sm">Load roster from CSV (Postgres)</h3>
        <p className="text-xs mb-3">
          Replaces all rows for that table. Use the same column layout as{" "}
          <code>data/students.csv</code> and <code>data/instructors.csv</code>.
        </p>
        <label className="block text-sm mb-2">
          Students CSV
          <input
            type="file"
            accept=".csv"
            className="hover:backdrop-brightness-125 active:backdrop-brightness-75 block mt-1 border p-1 w-full"
            onChange={onStudentsCsvUpload}
          />
        </label>
        <label className="block text-sm">
          Instructors CSV
          <input
            type="file"
            accept=".csv"
            className="hover:backdrop-brightness-125 active:backdrop-brightness-75 block mt-1 border p-1 w-full"
            onChange={onInstructorsCsvUpload}
          />
        </label>
      </div>

      <CreateStudent sections={section_data} teachers={instructor_data}></CreateStudent>
      <CreateTeacher></CreateTeacher>
      <EditStudent
        sections={section_data}
        students={student_data}
        teachers={instructor_data}
      ></EditStudent>
      <EditTeacher sections={section_data} teachers={instructor_data}></EditTeacher>
      <DeleteStudent students={student_data}></DeleteStudent>
      <DeleteTeacher instructors={instructor_data}></DeleteTeacher>
    </div>
  );
}
