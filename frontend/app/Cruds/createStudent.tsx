import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import * as API from '../SendToApi';
import { getStudentName, getTeacherName } from "../HelperFunctions";
import { section_data, teacher_data } from "../GetFromApi";

interface CreateStudentProps{
    scheduleSections: string[];
}

var minRank = "0";
var maxRank = "10";

export default function CreateStudent({scheduleSections}: CreateStudentProps){
    const [teachers, setTeachers] = useState<TeacherProps[]>([])

    const [name, setName] = useState<string>("no_name");
    const [mathScore, setMathScore] = useState<number>(5);
    const [englishScore, setEnglishScore] = useState<number>(5);
    const [aslScore, setAslScore] = useState<number>(5);

    const [subjectRankings, setSubjectRankings] = useState<Record<string, number>>({"math": 5, "english": 5, "asl": 5});
    const [sections, setSections] = useState<SectionProps[]>([]);
    const [sectionIds, setSectionIds] = useState<string[]>([]);



    /**
     * Calls the helper functions that updates the section lists.
     * @param e ChangeEvent<HTMLInputElement>, check event
     * @param value string, the section id
     */
    function updateSections(e: ChangeEvent<HTMLInputElement>, value: string): void {
        if(e.target.checked){
            setSectionIds(prev => [...prev, value]);
        }
        else{
            setSectionIds(prev => prev.filter(x => x !== value));
        }
    }

    /**
     * Create a student
     * 
     * @param e FormEvent<HTMLFormElement>
     * @param student_name unused
     * @param subject_rankings unused
     * @param section_ids unused
     */
    async function createStudent(e: FormEvent<HTMLFormElement>, student_name: string = "", subject_rankings: Record<string, number> = {}, section_ids: string[] = []){
        e.preventDefault(); // prevents page reload on form submission
        
        student_name = name;
        subject_rankings = {
            "math": mathScore, 
            "english": englishScore, 
            "asl": aslScore};
        section_ids = sectionIds;

        console.log("Student Creation Initiated: ");
        console.log("student_name: " + student_name);
        console.log("subject_abilities: " + JSON.stringify(subject_rankings));
        console.log("section_ids: " + section_ids);

        API.createStudent({
            "name": student_name,
            "subject_abilities": subject_rankings,
            "section_ids": section_ids
        })

        await e.currentTarget.reset(); // reset the data
        setName("no_name");
        setSectionIds([]);
        setMathScore(5);
        setEnglishScore(5);
        setAslScore(5);
        console.log(sectionIds);


    }

    useEffect(() => {
        console.log("sectionIds changed:", sectionIds);
    }, [sectionIds]);

    useEffect(() => {
        setSections(section_data)
        setTeachers(teacher_data)
    }, []);



    return (
        <details className="mb-2">
            <summary className="hover:backdrop-brightness-125 p-4"> Create Student (Click to collapse/expand)</summary>
            <div className={"border-2 p-4 m-4 ml-0 border-white/50"}>
                <form name="createStudentForm" onSubmit={(e) => createStudent(e)}>
                    <input type="text" id="name" className={"ml-4 border-2 p-1 hover:backdrop-brightness-125 active:backdrop-brightness-90"} onChange={(e) => setName(e.currentTarget.value)}
                        data-tooltip-id="my-tooltip" data-tooltip-content="Enter new student's name" />
                    <label className={"p-2 pr-4"} >Student Name</label>
                    <br />
                    <input type="range" min={minRank} max={maxRank} id="mathRank" className={"border-2 p-1 ml-4"} onChange={(e) => setMathScore(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{mathScore} : Math Ability Level</label>
                    <br />
                    <input type="range" min={minRank} max={maxRank} id="englishRank" className={"border-2 p-1 ml-4"} onChange={(e) => setEnglishScore(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4"} >{englishScore} : English Ability Level</label>
                    <br />
                    <input type="range" min={minRank} max={maxRank} id="aslRank" className={"border-2 p-1 ml-4"} onChange={(e) => setAslScore(Number(e.currentTarget.value))}/>
                    <label className={"p-2 pr-4 "} >{aslScore} : ASL Ability Level</label>    
                    <br />

                    <label className={"p-2 pr-4"} >Sections:</label> 
                    {/* <input type="text" id="sections" className={"border-2 p-1 hover:backdrop-brightness-125 active:backdrop-brightness-90"}/> */}
                    
                    {/* Generate list of all selectable sections */}
                    <details className={"border-2 m-4 pt-4 pb-4 border-white/50"}>
                        <summary className="hover:backdrop-brightness-125 p-4"
                            data-tooltip-id="my-tooltip" data-tooltip-content="Select all sections student will be attending" 
                        >Sections (Click to collapse/expand)</summary>
                        {Object.entries(sections).map(([key, section]) => {

                            // incrementSectionCount();
                            // const [day, timeBlockId] = key.split("-");
                            return (
                                <div key={key} className="mb-2 border-b border-white/50">
                                    <input type="checkbox" id={section.id} value={section.id} checked={sectionIds.includes(section.id)} className={"h-4 w-4 ml-8"} onChange={(e) => updateSections(e, e.currentTarget.value)}/>
                                    <label className={"p-2 pr-4 pl-6"} >{section.subject} | {section.level} | {getTeacherName(teachers, section.teacherId)} | {section.id}</label>    
                                </div>
                            );
                        })
                        }
                    </details>
                    {/* <input type="checkbox" id="sections" className={"border-2 p-1 hover:backdrop-brightness-125 active:backdrop-brightness-90"}/> */}

                    <button type="submit" className={"border-2 p-1 ml-4 w-35 hover:backdrop-brightness-125 active:backdrop-brightness-90"}>Create</button>
                </form>
            </div>
        </details>
    );
}