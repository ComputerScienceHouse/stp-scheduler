'use client'

import { useEffect, useState } from "react";
import { InstructorProps } from "../InstructorProps";
import { SectionProps } from "../SectionProps";
import { StudentProps } from "../StudentProps";
import { getSectionLevel } from "./SectionCard";
import { getBackgroundColor, getInstructorName } from "../HelperFunctions";

interface StudentScheduleProps{
    student: StudentProps; // The student
    instructors: InstructorProps[];
    sections: SectionProps[];
}

/**
 * The number of sections in the grid
 */
var sectionCount = 0;

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
 * Groups the given sections into a Record by timeBlock
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
            console.log("getStartColumn in page.tsx: failed to calculate column");
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


export default function StudentSchedule({student, instructors, sections}: StudentScheduleProps){
    const [studentData, setStudentData] = useState<StudentProps>({
        id: "",
        name: "name",
        subject_rankings: {},
        sectionIds: []
    } as StudentProps);
    const [instructorData, setInstructorData] = useState<InstructorProps[]>([{}] as InstructorProps[]);
    const [sectionData, setSectionData] = useState([{
        id: "", 
        subject: "string", 
        level: 0, 
        timeBlockId: 0, 
        days: ["M", "T", "W", "R", "F"], 
        studentIds: [""], 
        instructorId: ""
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
    
    const groupedSections = groupSections(sectionData as []);
    resetSectionCount();

    useEffect(() => {
        setStudentData(student);
        setInstructorData(instructors);
        try{
            setSectionData(sections.filter((section) => student.sectionIds.includes(section.id))); // only set sections the student belongs to.
        }
        catch{
            setSectionData(sections);
        }
        setTimeblockData(
            [ // default timeblock data
                {"id": 0, "start": "08:00", "end": "09:00"},
                {"id": 1, "start": "09:15", "end": "10:15"},
                {"id": 2, "start": "10:30", "end": "11:30"},
                {"id": 3, "start": "11:45", "end": "12:45"},
                {"id": 4, "start": "12:45", "end": "13:45"},
                {"id": 5, "start": "13:45", "end": "14:45"},
                {"id": 6, "start": "15:00", "end": "16:00"}
            ]
        );
    }, [student, instructors, sections]);

    return (
        <>
        {/*  Schedule */}
        <div className="m-12 mb-2 mt-0 p-4 rounded-4xl bg-gray-800">
            <h1>{studentData?.name}</h1>
            <div 
                id="schedule"
                className="grid grid-cols-[6rem_repeat(5,1fr)] auto-rows-min grid-flow-dense w-auto border-2 border-solid border-(--main-text-color) bg-(--main-background-color) bg-opacity-50 text-base rounded-4xl"
                // grid-rows-[4rem_repeat(11,1fr)]
                style={{
                overflowY: "scroll",
                height: "70vh"
                // gridTemplateRows: `4rem repeat(${timeblockData.length}, 1fr)`
                }}
            >
                
                {/* Fill in the days on top */}
                <h4 className="flex justify-center items-center col-start-1 col-span-1 bg-(--main-background-color) text-(--main-text-color) font-bold border-3 border-t-0 border-l-0 border-solid rounded-tl-4xl">Time</h4>
                <h4 className="flex justify-center items-center col-start-2 col-span-1 bg-(--main-background-color) text-(--main-text-color) border-3 border-t-0 border-l-0 border-r-2 border-solid">Monday</h4>
                <h4 className="flex justify-center items-center col-start-3 col-span-1 bg-(--main-background-color) text-(--main-text-color) border-3 border-t-0 border-l-0 border-r-2 border-solid">Tuesday</h4>
                <h4 className="flex justify-center items-center col-start-4 col-span-1 bg-(--main-background-color) text-(--main-text-color) border-3 border-t-0 border-l-0 border-r-2 border-solid">Wednesday</h4>
                <h4 className="flex justify-center items-center col-start-5 col-span-1 bg-(--main-background-color) text-(--main-text-color) border-3 border-t-0 border-l-0 border-r-2 border-solid">Thursday</h4>
                <h4 className="flex justify-center items-center col-start-6 col-span-1 bg-(--main-background-color) text-(--main-text-color) border-3 border-t-0 border-l-0 border-r-0 border-solid rounded-tr-4xl">Friday</h4>

                {/* Fill in the time on the left */}
                {timeblockData.map(time => (
                <div key={time.id} className="flex justify-center text-center text-sm items-center p-1 col-start-1 col-span-1 bg-(--main-background-color) text-(--main-text-color) border-3 border-b-2 border-t-0 border-l-0 border-solid">{militaryToCivilianTime(time.start)} - {militaryToCivilianTime(time.end)}</div>
                ))}


                {/* Create & Fill Cells with Sections */}
                {Object.entries(groupedSections).map(([key, sections]) => {
                incrementSectionCount();
                const [day, timeBlockId] = key.split("-");
                return (
                    <div // TODO: make text size based on the window size so that it is always more legible
                    key={key}
                    className="col-span-1 row-span-1 border-2 border-t-0 border-l-0 border-solid border-(--main-text-color) p-2 flex flex-col gap-2 text-center"
                    style={{
                        gridColumnStart: getStartColumn(day),
                        gridColumnEnd: `span 1`,
                        gridRowStart: getStartRow(parseInt(timeBlockId)),
                        gridRowEnd: `span 1`
                    }}
                    >
                    {sections.map((section, index) => (
                        // A Section the student belongs to
                        <div
                            className="flex grow col-span-1 row-span-1 p-4 pl-2 pr-2 text-lg justify-center items-center rounded-2xl flex-col"
                            style={{
                                backgroundColor: getBackgroundColor(section.subject),
                            }}
                            key={index}
                        >
                            {getInstructorName(instructorData as InstructorProps[], section.instructorId)} -{" "}
                            {getSectionLevel(section.level)}{" "}
                            {section.subject.charAt(0).toUpperCase() + section.subject.slice(1)}
                        </div>
                    ))}
                    </div>
                );
                })}


                {/* Fill in empty spaces */}
                {Array.from({ length: getEmptySpacesCount() }, (_, index) => (
                    <div key={index} className="col-span-1 row-span-1 border-2 border-t-0 border-l-0 border-solid border-(--main-text-color) p-6 text-center"></div>
                ))}
            </div>
        </div>
        </>
    );
}