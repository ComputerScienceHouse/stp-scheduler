/**
 * Author: Addison A (ShadowArcher289)
 * Created: 5/23/2026
 * Last Updated: 5/23/2026
 * 
 * Editors: 
 */

import { instructor_data, section_data, student_data } from "../GetFromApi";


// TODO: this downloads data in a csv format that cannot be used to load again. perhaps implement two load from csv functions, one from raw data and another to set the schedule to what it was before?
// my thoughts now is change the data downloaded to basically a 

interface DownloadButtonProps{
    filetype: string;
}

/**
 * Parses the jsonData into a format suitable for a csv file.
 * @param jsonData string[]
 * @returns string
 */
function jsonToCsv(jsonData: string[]){
    let csv = "";

    const headers = Object.keys(jsonData[0]);
    // headers.forEach(header => { // beginning of implementation to put ability score ranks as headers instead of 'subjects'
    //     if(typeof jsonData[0][header as any] === 'object'){
    //         return `${Object.keys(jsonData[0][header as any] as Object).join(',')}`
    //     }
    // });
    csv += headers.join(',') + "\n";

    // Extract values
    jsonData.forEach(obj => {
        const values = headers.map(header => {
            const value = obj[header as any];

            if (Array.isArray(value) || typeof value === 'object') {
                // JSON stringify nested structures
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }

            // Handle primitives (string, number, null)
            if (typeof value === 'string') {
                // Escape quotes inside strings
                return `"${value.replace(/"/g, '""')}"`;
            }

            return value ?? '';
        });
        // console.log("values: " + values);
        csv += values.join(',') + '\n';
        // console.log("csv: " + csv);
    });
    
    return csv;
}

/**
 * Determines which file download system to use.
 * @param type the filetype (ex: csv)
 * @param data the data to download
 */
function downloadFile(type: string){
    var data = [JSON.stringify(student_data), JSON.stringify(instructor_data), JSON.stringify(section_data)];
    console.log(data);

    switch (type.toLowerCase()) {
        case "csv":
            downloadCSVFile([jsonToCsv(student_data)], "stpStudentData");
            downloadCSVFile([jsonToCsv(instructor_data)], "stpInstructorData");
            downloadCSVFile([jsonToCsv(section_data)], "stpSectionData");
            break;
        default:
            console.log("Error, invalid filetype to download: " + type);
            break;
    }
}

/**
 * Calls the device to download schedule as a .csv file.
 * @param data 
 * @param filename
 */
function downloadCSVFile(data: string[], filename: string = "stpSchedule"){
    console.log(data);
    const blob = new Blob(data, { type: "text/csv" });

    // Generating a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();

    // Cleanup memory when done
    URL.revokeObjectURL(url);
}

/**
 * A button element that when clicked downloads a file to the user's computer.
 */
export default function DownloadButton({filetype}: DownloadButtonProps){
    return(
        <>
            <button onClick={async () => downloadFile(filetype)} className={"border-2 active:backdrop-brightness-90 p-2 pl-4 pr-4 mr-4"}>
                Download as .csv
            </button>
        </>
    );
}