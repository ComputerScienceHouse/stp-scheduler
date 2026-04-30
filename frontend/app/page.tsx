'use client'

import localData from "../data/BackendData.json";
import * as GetAPI from "./GetFromApi";
import * as SendAPI from "./SendToApi";
import Section from "./Components/sectionCard";
import { useEffect, useRef, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useReactToPrint } from "react-to-print";

/**
 * Author: Addison A
 * Last Updated: 1/16/2026
 * 
 * Editors: 
 */

/**
 * The number of sections in the grid
 */
var sectionCount = 0;

// var pageStudentData = localData.students;
// var pageTeacherData = localData.teachers;
// var pageTimeblockData = localData.timeBlock;
// var pageSectionData = localData.sections;
var pageStudentData: StudentProps[] = [];
var pageTeacherData: TeacherProps[] = [];
var pageTimeblockData = localData.timeBlock;
var pageSectionData: SectionProps[] = [];

/**
 * Changes the cursor to a loading state for 1 second.
 * 
 * @param duration int (milliseconds)
 */
function showLoadingCursor(duration: number): void {
  const bodyElement = document.body;

  // 1. Add the 'waiting' class to the body
  bodyElement.classList.add('waiting');

  // 2. Set a timeout to remove the class after 1000 milliseconds (1 second)
  setTimeout(() => {
    bodyElement.classList.remove('waiting');
  }, duration);
}

/**
 * Calls the backend to regenerate the schedule, and then update the table data
 */
function regenerateTableSchedule() {
  SendAPI.regenerateSchedule();

  updateTableData();
}

/**
 * Updates the page's data to the data from the InputPage
 */
function updateTableData() {
  console.log("Data being updated")

  GetAPI.getFromBackendApi("Teachers");
  GetAPI.getFromBackendApi("Students");
  GetAPI.getFromBackendApi("Sections");

  if (GetAPI.student_data != "" && (pageStudentData != GetAPI.student_data)){
    pageStudentData = GetAPI.student_data
  }
  if (GetAPI.teacher_data != "" && (pageTeacherData != GetAPI.teacher_data)){
    pageTeacherData = GetAPI.teacher_data
  }
  if (GetAPI.section_data != "" && (pageSectionData != GetAPI.teacher_data)){
    pageSectionData = GetAPI.section_data
  }
  // if (timeblock_data != "" && (pageTimeblockData != teacher_data)){
  //   pageTimeblockData = teacher_data
  // }

}

/**
 * Converts time from military time(ex: 13:00) to civilian time(ex: 1:00pm)
 * @param time string
 * @returns string
 */
function militaryToCivilianTime(time: string): string{
  var splitTime = time.split(":");
  var suffix = "am";
  if(parseInt(splitTime[0]) > 12){
    splitTime[0] = (parseInt(splitTime[0]) - 12).toString();
    suffix = "pm";
  }
  return splitTime.join(":") + suffix;
}


/**
 * Increments the sectionCount by 1
 */
function incrementSectionCount(): void{
  sectionCount++;
}

/**
 * Resets the SectionCount to 0
 */
function resetSectionCount(){
  sectionCount = 0;
}

/**
 * Groups the given sections into a Record by each day's timeBlock
 * @param sections 
 * @returns Record<string, SectionProps[]>
 */
function groupSections(sections: any[]): Record<string, SectionProps[]> {
  const grouped: Record<string, SectionProps[]> = {};
  sections.forEach(section => {
    section.days.forEach((day: string) => { // creates a key for each day's timeBlock present in the section list.
      const key = `${day}-${section.timeBlockId}`;
      if (!grouped[key]){
        grouped[key] = [];
      }
      grouped[key].push(section); // sets the section to a key
    });
  });
  return grouped;
}

/**
 * Returns the column number that corresponds to a given day
 * @param day string (ex: 'M' for Monday, 'W' for Wednesday, 'R' for Thursday)
 * @returns number
 */
function getStartColumn(day: string): number{
    var column = 7; // the default column is, column 7, the buffer

    switch (day) { // set the column based on the given day
        case "M":
            column = 2;
            break;
        case "T":
            column = 3;
            break;
        case "W":
            column = 4;
            break;
        case "R":
            column = 5;
            break;
        case "F":
            column = 6;
            break;
        default:
            console.log("getStartColumn in sectionCard.tsx: failed to calculate column");
            break;
    }
    return column;
}

/**
 * Returns the respective row number for a given timeBlock.
 * @param timeBlockId id of the timeBlock for a given section
 * @returns number
 */
function getStartRow(timeBlockId: number){
    return timeBlockId + 2;
}


export default function Home() {
  const [studentData, setStudentData] = useState([{}]);
  const [teacherData, setTeacherData] = useState([{}]);
  const [sectionData, setSectionData] = useState([{
    id: "", 
    subject: "string", 
    level: 0, 
    timeBlockId: 0, 
    days: ["M", "T", "W", "R", "F"], 
    studentIds: [""], 
    teacherId: ""
  }]);
  const [timeblockData, setTimeblockData] = useState([{
    id: 0, 
    start: "", 
    end: ""
  }]);

  /**
   * Returns the number of unused cells in the grid. Calculates cell count using the number of timeBlocks in localData * 5(the number of days)
   * @returns number
   */
  function getEmptySpacesCount(): number{
    return (timeblockData.length * 5) - sectionCount;
  }
  
  /**
   * Updates the schedule's data 
   */
  function generateSchedule(){
    showLoadingCursor(100)
    updateTableData()

    if(pageSectionData != null && pageStudentData != null && pageTeacherData != null && pageTimeblockData != null){
      setStudentData(pageStudentData)
      setTeacherData(pageTeacherData)
      setSectionData(pageSectionData)
      setTimeblockData(pageTimeblockData)
    }
    else{
      console.log("Error: not loaded")
    }

    console.log("schedule generated")
  }

  const groupedSections = groupSections(sectionData as []);
  resetSectionCount();


  /**
   * calls the GetAPI to repopulate its data
   */
  useEffect(() => {
    async function fetchData(){
      await SendAPI.regenerateSchedule();
      await GetAPI.getFromBackendApi("Teachers");
      await GetAPI.getFromBackendApi("Students");
      await GetAPI.getFromBackendApi("Sections");

      generateSchedule();
    }

    fetchData();
  }, []);

  
  const scheduleRef = useRef<HTMLDivElement>(null);

  const print = useReactToPrint({
    documentTitle: "Schedule",
    pageStyle: `
      @media print {
        #schedule {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
      }
    `
  });

  const handlePrint = () => {
    print(() => scheduleRef.current);
  };

  return (

    <section className="max-w-dvw items-center justify-center font-sans dark:bg-[var(--main-background-color)]">
      <Tooltip id="my-tooltip" />
      {/* Inputs */}
      {/* <InputPage path={"../data/InputTestData.json"}></InputPage> */}

      <div className={"p-4 pl-16 mb-4 border-b-2 bg-[#f76902] text-white"}>
        <button onClick={regenerateTableSchedule} className={"border-2 active:backdrop-brightness-90 p-2 pl-4 pr-4 mr-4"}>Regenerate Schedule</button>
        {/* <button onClick={handlePrint} className={"border-2 active:backdrop-brightness-90 p-2 pl-4 pr-4"}>Print Schedule</button> */}
      </div>
      

      {/*  Schedule */}
      <div className="m-12 mb-2 mt-0 p-4 rounded-4xl bg-gray-800" ref={scheduleRef}>
        <div 
          id="schedule"
          className="grid grid-cols-[6rem_repeat(5,1fr)] auto-rows-min grid-flow-dense w-auto border-2 border-solid border-[var(--main-text-color)] bg-[var(--main-background-color)] bg-opacity-50 text-base rounded-4xl"
          // grid-rows-[4rem_repeat(11,1fr)]
          style={{
            overflowY: "scroll",
            height: "70vh"
            // gridTemplateRows: `4rem repeat(${timeblockData.length}, 1fr)`
          }}
        >
          
          {/* Fill in the days on top */}
          <h4 className="flex justify-center items-center col-start-1 col-span-1 bg-[var(--main-background-color)] text-[var(--main-text-color)] font-bold border-3 border-t-0 border-l-0 border-solid rounded-tl-4xl">Time</h4>
          <h4 className="flex justify-center items-center col-start-2 col-span-1 bg-[var(--main-background-color)] text-[var(--main-text-color)] border-3 border-t-0 border-l-0 border-r-2 border-solid">Monday</h4>
          <h4 className="flex justify-center items-center col-start-3 col-span-1 bg-[var(--main-background-color)] text-[var(--main-text-color)] border-3 border-t-0 border-l-0 border-r-2 border-solid">Tuesday</h4>
          <h4 className="flex justify-center items-center col-start-4 col-span-1 bg-[var(--main-background-color)] text-[var(--main-text-color)] border-3 border-t-0 border-l-0 border-r-2 border-solid">Wednesday</h4>
          <h4 className="flex justify-center items-center col-start-5 col-span-1 bg-[var(--main-background-color)] text-[var(--main-text-color)] border-3 border-t-0 border-l-0 border-r-2 border-solid">Thursday</h4>
          <h4 className="flex justify-center items-center col-start-6 col-span-1 bg-[var(--main-background-color)] text-[var(--main-text-color)] border-3 border-t-0 border-l-0 border-r-0 border-solid rounded-tr-4xl">Friday</h4>

          {/* Fill in the time on the left */}
          {timeblockData.map(time => (
            <div key={time.id} className="flex justify-center text-center text-sm items-center p-1 col-start-1 col-span-1 bg-[var(--main-background-color)] text-[var(--main-text-color)] border-3 border-b-2 border-t-0 border-l-0 border-solid">{militaryToCivilianTime(time.start)} - {militaryToCivilianTime(time.end)}</div>
          ))}


          {/* Create & Fill Cells with Sections */}
          {Object.entries(groupedSections).map(([key, sections]) => {
            incrementSectionCount();
            const [day, timeBlockId] = key.split("-");
            return (
              <div // TODO: make text size based on the window size so that it is always more legible
                key={key}
                className="col-span-1 row-span-1 border-2 border-t-0 border-l-0 border-solid border-[var(--main-text-color)] p-2 flex flex-col gap-2 text-center"
                style={{
                  gridColumnStart: getStartColumn(day),
                  gridColumnEnd: `span 1`,
                  gridRowStart: getStartRow(parseInt(timeBlockId)),
                  gridRowEnd: `span 1`
                }}
              >
                {sections.map((section, index) => (
                  <Section key={index} section={section as SectionProps} teachers={teacherData as TeacherProps[]} students={studentData as StudentProps[]}></Section>
                ))}
              </div>
            );
          })}


          {/* Fill in empty spaces */}
          {Array.from({ length: getEmptySpacesCount() }, (_, index) => (
            <div key={index} className="col-span-1 row-span-1 border-2 border-t-0 border-l-0 border-solid border-[var(--main-text-color)] p-6 text-center"></div>
          ))}
        </div>
      </div>

    </section>
  );
}
