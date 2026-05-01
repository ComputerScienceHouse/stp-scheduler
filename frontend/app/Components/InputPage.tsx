"use client"

import { useEffect, useState } from 'react';
import * as XLSX from '@e965/xlsx';
import * as API from '../SendToApi';
import CreateStudent from '../Cruds/createStudent';
import CreateTeacher from '../Cruds/createTeacher';
import * as GetAPI from "./../GetFromApi";
import EditStudent from '../Cruds/editStudent';
import EditTeacher from '../Cruds/editTeacher';
import DeleteStudent from '../Cruds/deleteStudent';
import DeleteTeacher from '../Cruds/deleteTeacher';
import { Tooltip } from 'react-tooltip';

import { section_data, teacher_data, student_data } from "../GetFromApi";
// TODO: update immediately rather than requiring page.tsx to be loaded first.

/**
 * Author: Addison A
 * Last Updated: 3/27/2026
 * 
 * Editors: 
 */

interface InputPageProps {
    path: string;
}

/**
 * Write to a specified json file 
 * @param filePath the file's path
 * @param newJsonData data for the file
 */
function writeToJson(filePath: string, newJsonData: string){
    console.log("Writing data:")
    console.log("Filepath: " + filePath);
    console.log("newJsonData: " + newJsonData);

    // TODO: Set data to the .json files or update backend data
}

/**
 * Page for inputting and modifying data in the .json file TO-DO: Implement this. 
 * @param jsonFile the json to edit. Default: "../data/SchedulerData.json"
 * @returns <div></div>
 */
export default function InputPage({path}: InputPageProps){
    const [teacherData, setTeacherData] = useState<string>("");
    const [studentData, setStudentData] = useState<string>("");
    const [sectionData, setSectionData] = useState<string[]>([]);
    const [sectionIds, setSectionIds] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<any>("");
    /**
     * Handles file upload. Generated from Copilot
     * @param e 
     * @returns null if invalid
     */
    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: String) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (evt) => {
            const data = evt.target?.result;
            if (!data) return;

            // Parse the workbook
            const workbook = XLSX.read(data, { type: "binary" });

            // Get the first sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Convert to JSON
            const json = XLSX.utils.sheet_to_json(sheet);

            // Store JSON as a string so <p> can display it
            if(type.toLowerCase() === "teachers"){
                setTeacherData(JSON.stringify(json, null, 2));
                GetAPI.setGlobalTeacherData(JSON.stringify(json, null, 2))
                writeToJson(path, JSON.stringify(json));
            }
            else if(type.toLowerCase() === "csv"){
                setCsvData(json);
                API.updateFromCSV(json);
            }
            else if(type.toLowerCase() === "student"){
                setStudentData(JSON.stringify(json, null, 2));
                GetAPI.setGlobalStudentData(JSON.stringify(json, null, 2))
                writeToJson(path, JSON.stringify(json));
            }
            
        };

        reader.readAsBinaryString(file);
    }

    /**
     * Runs fetch a request to retrieve specified data from the backend and calls to set the .json file to it
     */
    // async function getFromBackendApi(type: string){
    //     try {
    //         const response = await fetch('http://localhost:8000/' + type.toLowerCase());

    //         if (!response.ok) { 
    //             throw new Error(`HTTP error! status: ${response.status}`); 
    //         }

    //         const result = await response.json();
    //         console.log(result);
    //         writeToJson("..\\data\\actualData\\" + type + ".json", result);

    //         switch (type) {
    //             case "Teachers":
    //                 teacher_data = result;
    //                 // console.log("Teacher data:\n" + teacher_data.toString())
    //                 // setTeacherData(teacher_data);
    //                 break;
                
    //             case "Students":
    //                 student_data = result;
    //                 // console.log("Student data:\n" + student_data.toString())
    //                 // setStudentData(student_data);
    //                 break;
    //             case "Sections":

    //                 if(!idsRetrieved){ // TODO: temporary conditional, this should be updated so that the section ids are generated
    //                     var ids: string[] = [];
    //                     result.forEach((element: Record<string, any>) => {
    //                         ids.push(element.id);
    //                     });
    //                     setSectionIds(ids);
    //                     setIdsRetrieved(true);
    //                 }
                    
    //                 section_data = result;
                    
    //                 section_data.forEach((element: { days: string[]; }) => { // REMOVE LATER: the backend does not set days, these lines should be removed once it does.
    //                     element.days = ["M", "T", "W", "R", "F"]; 
    //                 });
    //                 // console.log("Sections data:\n" + section_data.toString())
                    
    //                 break;
            
    //             default:
    //                 break;
    //         }


    //     } catch (err) {
    //         console.log("ERROR: The backend did not retrieve data: " + err);
    //     }
    // }


    /**
     * calls the GetAPI to repopulate its data
     */
    useEffect(() => {
        GetAPI.getFromBackendApi("Teachers");
        GetAPI.getFromBackendApi("Students");
        GetAPI.getFromBackendApi("Sections");

        setSectionIds(GetAPI.section_ids);
    }, [])
    


    // Contains functions for retrieving data 
    return(
        <div className={"p-4 pl-16 mb-4 border-b-2 bg-[#f76902] text-white"}>
        <Tooltip id="my-tooltip" />
            {/* <button onClick={() => getFromBackendApi("Teachers")} className={"border-2 active:backdrop-brightness-90"}>Get Teachers data (Make sure backend is running)</button>
            <button onClick={() => getFromBackendApi("Students")} className={"border-2 active:backdrop-brightness-90"}>Get Students data</button>
            <button onClick={() => getFromBackendApi("Sections")} className={"border-2 active:backdrop-brightness-90"}>Get Sections data</button> */}

            {/* <button onClick={() => getFromBackendApi("Timeblocks")} className={"border-2 active:backdrop-brightness-90"}>Get Timeblocks data</button> */}
            
            {/* User can input csv files*/}
            {/* <form name="fileInput">
                <br />
                <label className={"p-2 pr-4"} >Submit Instructors:</label>
                <input type="file" id="fileInput" className={"border-2 p-1 hover:backdrop-brightness-125 active:backdrop-brightness-90"} accept=".xlsx" onChange={(e) => handleFileUpload(e, "teachers")}/>
            </form>
            <form name="fileInput">
                <br />
                <label className={"p-2 pr-4"} >Submit Students:</label>
                <input type="file" id="fileInput" className={"border-2 p-1 hover:backdrop-brightness-125 active:backdrop-brightness-90"} accept=".xlsx" onChange={(e) => handleFileUpload(e, "students")}/>
            </form> */}

            {/* TODO: Implement in the backend */}
            {/* <form name="fileInput">
                <br />
                <label className={"p-2 pr-4"} >Submit .xlsx (Microsoft Excel) File:</label>

                <input type="file" id="fileInput" className={"border-2 p-1 hover:backdrop-brightness-125 active:backdrop-brightness-90"} 
                    accept=".xlsx" onChange={(e) => handleFileUpload(e, "csv")} 
                    data-tooltip-id="my-tooltip" data-tooltip-content="Upload an Excel file from your computer" />
            </form> */}

            <br></br>

            <p>{teacherData}</p>
            <p>{studentData}</p>


            <CreateStudent scheduleSections={sectionIds}></CreateStudent>
            <CreateTeacher scheduleSections={sectionIds}></CreateTeacher>
            <EditStudent sections={section_data} students={student_data} teachers={teacher_data}></EditStudent>
            <EditTeacher sections={section_data} teachers={teacher_data}></EditTeacher>
            <DeleteStudent></DeleteStudent>
            <DeleteTeacher></DeleteTeacher>
        </div>
    );
}
